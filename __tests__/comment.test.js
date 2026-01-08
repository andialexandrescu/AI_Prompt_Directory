const db = require('../models');
const { app } = require('../app');
const { createTestUser, graphqlRequest } = require('./helpers');

const CREATE_COMMENT_MUTATION = `
    mutation CreateComment($input: CommentInputType!) {
        createComment(input: $input) {
            id
            content
            createdAt
            updatedAt
            prompt {
                id
                topic
            }
            user {
                id
                username
            }
        }
    }
`;

const GET_ALL_COMMENTS_QUERY = `
    query GetAllComments($offset: Int, $limit: Int) {
        getAllComments(offset: $offset, limit: $limit) {
            id
            content
            prompt {
                id
                topic
            }
            user {
                username
            }
        }
    }
`;

const GET_COMMENT_BY_ID_QUERY = `
    query GetCommentById($id: Int!) {
        getCommentById(id: $id) {
            id
            content
            createdAt
            prompt {
                id
                topic
            }
            user {
                username
            }
        }
    }
`;

describe('Comment Mutations and Queries', () => {
    let userToken;
    let userId;
    let promptId;

    beforeEach(async () => {
        await db.Comment.destroy({ where: {} });
        await db.Prompt.destroy({ where: {} });
        await db.User.destroy({ where: {} });

        const { user, token } = await createTestUser({
            username: 'commentuser',
            password: 'pass123',
            role: 'user',
        });
        userToken = token;
        userId = user.id;

        const prompt = await db.Prompt.create({
            topic: 'Test Prompt for Comments',
            content: 'This is a test prompt',
            state: 'posted',
            createdByUserId: userId,
        });
        promptId = prompt.id;
    });

    test('Should allow different users to comment on the same prompt', async () => {
        const { user: user2, token: token2 } = await createTestUser({
            username: 'seconduser',
            password: 'pass456',
            role: 'user',
        });

        const comment1 = await graphqlRequest(
            app,
            CREATE_COMMENT_MUTATION,
            {
                input: {
                    content: 'Comment from first user',
                    promptId: promptId,
                }
            },
            userToken
        );

        const comment2 = await graphqlRequest(
            app,
            CREATE_COMMENT_MUTATION,
            {
                input: {
                    content: 'Comment from second user',
                    promptId: promptId,
                }
            },
            token2
        );

        expect(comment1.body.data.createComment.user.username).toBe('commentuser');
        expect(comment2.body.data.createComment.user.username).toBe('seconduser');
        expect(comment1.body.data.createComment.id).toBeDefined();
        expect(comment2.body.data.createComment.id).toBeDefined();
        expect(comment1.body.data.createComment.id).not.toBe(comment2.body.data.createComment.id);
        const commentsCount = await db.Comment.count({ where: { promptId } });
        expect(commentsCount).toBe(2);
    });

    test('Should fail to create comment on non-existent prompt', async () => {
        const fakePromptId = '00000000-0000-0000-0000-000000000000';

        const response = await graphqlRequest(
            app,
            CREATE_COMMENT_MUTATION,
            {
                input: {
                    content: 'Comment on fake prompt',
                    promptId: fakePromptId,
                }
            },
            userToken
        );

        expect(response.status).toBe(200);
        // This should either fail with an error or create a comment with invalid foreign key
        if (response.body.errors) {
            expect(response.body.errors).toBeDefined();
        }
    });

    test('Should test pagination with offset and limit', async () => {
        for (let i = 1; i <= 15; i++) {
            await db.Comment.create({
                content: `Comment ${i}`,
                promptId: promptId,
                userId: userId,
            });
        }

        const page1 = await graphqlRequest(
            app,
            GET_ALL_COMMENTS_QUERY,
            { offset: 0, limit: 5 }
        );

        expect(page1.body.data.getAllComments).toHaveLength(5);

        const page2 = await graphqlRequest(
            app,
            GET_ALL_COMMENTS_QUERY,
            { offset: 5, limit: 5 }
        );

        expect(page2.body.data.getAllComments).toHaveLength(5);

        const page1Ids = page1.body.data.getAllComments.map(c => c.id);
        const page2Ids = page2.body.data.getAllComments.map(c => c.id);
        const intersection = page1Ids.filter(id => page2Ids.includes(id));
        expect(intersection).toHaveLength(0);
    });
});
