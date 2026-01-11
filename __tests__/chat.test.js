// __tests__/chat.test.js
const db = require('../models');
const { app } = require('../app');
const { graphqlRequest, createTestUser } = require('./helpers');




const POST_CHAT_MESSAGE_MUTATION = `
  mutation PostChatMessage($input: PostChatMessageInput!) {
    postChatMessage(input: $input) {
      id
      content
      expiresAt
      user { id username role }
    }
  }
`;


const DELETE_CHAT_MESSAGE_MUTATION = `
  mutation DeleteChatMessage($input: DeleteChatMessageInput!) {
    deleteChatMessage(input: $input)
  }
`;
const GET_CHATROOM_BY_PROVIDER_QUERY = `
  query GetChatRoomByProvider($llmProviderId: Int) {
    getChatRoomByProvider(llmProviderId: $llmProviderId) {
      id
      llmProvider { id name }
    }
  }
`;

describe('Chat: postChatMessage, deleteChatMessage, getChatRoomByProvider cleanup', () => {
  let userToken;
  let adminToken;
  let userId;
  let llmProviderId;
  let chatRoomId;

  beforeEach(async () => {
    // ordine: child -> parent (ca să nu lovești FK-uri)
    await db.ChatMessage.destroy({ where: {} });
    await db.ChatRoom.destroy({ where: {} });
    await db.LLMProvider.destroy({ where: {} });
    await db.User.destroy({ where: {} });

    const userRes = await createTestUser({
      username: 'user1',
      password: 'pass123',
      role: 'user',
    });
    userToken = userRes.token;
    userId = userRes.user.id;

    const adminRes = await createTestUser({
      username: 'admin1',
      password: 'pass123',
      role: 'admin',
    });
    adminToken = adminRes.token;


    adminToken = adminRes.token;

    // seed provider + chatroom (ChatRoom are unique llmProviderId)
    const provider = await db.LLMProvider.create({
      name: 'ProviderTest',
      description: 'test',
      ranking: null,
      averageRating: null,
    });
    llmProviderId = provider.id;

    const room = await db.ChatRoom.create({ llmProviderId });
    chatRoomId = room.id;
  });

  test('Happy path: authenticated user can postChatMessage (DB row created, expiresAt set)', async () => {
    const response = await graphqlRequest(
      app,
      POST_CHAT_MESSAGE_MUTATION,
      { input: { chatRoomId, content: 'hello' } },
      userToken
    );

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();

    const msg = response.body.data.postChatMessage;
    expect(msg.id).toBeDefined();
    expect(msg.content).toBe('hello');
    expect(msg.user.id).toBe(userId);
    expect(msg.expiresAt).toBeDefined();

    const dbMsg = await db.ChatMessage.findByPk(msg.id);
    expect(dbMsg).toBeTruthy();
    expect(dbMsg.content).toBe('hello');
    expect(dbMsg.chatRoomId).toBe(chatRoomId);
    expect(dbMsg.userId).toBe(userId);

    // expiresAt ~ now + 3 min (nu testăm la milisecundă)
    const expiresAtMs = new Date(dbMsg.expiresAt).getTime();
    expect(expiresAtMs).toBeGreaterThan(Date.now());
  });

  test('Sad path: postChatMessage without token fails (Unauthorized) and does not insert DB row', async () => {
    const response = await graphqlRequest(
      app,
      POST_CHAT_MESSAGE_MUTATION,
      { input: { chatRoomId, content: 'no auth' } }
      // no token
    );

    expect(response.status).toBe(200);
    expect(response.body.data?.postChatMessage).toBeNull();
    expect(response.body.errors).toBeDefined();

    const count = await db.ChatMessage.count({ where: { content: 'no auth' } });
    expect(count).toBe(0);
  });

  test('Sad path: deleteChatMessage forbidden for non-admin (message remains in DB)', async () => {
    const seeded = await db.ChatMessage.create({
      content: 'to delete',
      chatRoomId,
      userId,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const response = await graphqlRequest(
      app,
      DELETE_CHAT_MESSAGE_MUTATION,
      { input: { messageId: seeded.id } },
      userToken // normal user
    );

    expect(response.status).toBe(200);
    expect(response.body.data?.deleteChatMessage).toBeNull();
    expect(response.body.errors).toBeDefined();

    const stillThere = await db.ChatMessage.findByPk(seeded.id);
    expect(stillThere).toBeTruthy();
  });

  test('Happy path: admin can deleteChatMessage (DB row removed)', async () => {
    const seeded = await db.ChatMessage.create({
      content: 'admin delete',
      chatRoomId,
      userId,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const response = await graphqlRequest(
      app,
      DELETE_CHAT_MESSAGE_MUTATION,
      { input: { messageId: seeded.id } },
      adminToken
    );

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteChatMessage).toBe(true);

    const gone = await db.ChatMessage.findByPk(seeded.id);
    expect(gone).toBeNull();
  });

  test('getChatRoomByProvider deletes expired messages before returning room', async () => {
    await db.ChatMessage.create({
      content: 'expired',
      chatRoomId,
      userId,
      expiresAt: new Date(Date.now() - 60_000),
    });

    await db.ChatMessage.create({
      content: 'alive',
      chatRoomId,
      userId,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const response = await graphqlRequest(
      app,
      GET_CHATROOM_BY_PROVIDER_QUERY,
      { llmProviderId }
    );

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getChatRoomByProvider.id).toBe(chatRoomId);
    expect(response.body.data.getChatRoomByProvider.llmProvider.id).toBe(llmProviderId);
    const expiredCount = await db.ChatMessage.count({ where: { content: 'expired' } });
    const aliveCount = await db.ChatMessage.count({ where: { content: 'alive' } });

    expect(expiredCount).toBe(0);
    expect(aliveCount).toBe(1);
  });
});
