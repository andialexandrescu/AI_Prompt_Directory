const db = require('../models');
const { app } = require('../app');
const { createTestUser, graphqlRequest } = require('./helpers');

const CREATE_LABEL_MUTATION = `
    mutation CreateLabel($name: String!) {
        createLabel(name: $name) {
            id
            name
            status
        }
    }
`;

const VALIDATE_LABEL_MUTATION = `
    mutation ValidateLabel($id: Int!, $status: String!) {
        validateLabel(id: $id, status: $status) {
            id
            name
            status
        }
    }
`;

const GET_ALL_LABELS_QUERY = `
    query GetAllLabels($offset: Int, $limit: Int) {
        getAllLabels(offset: $offset, limit: $limit) {
            id
            name
            status
            prompts {
                id
                topic
            }
        }
    }
`;

const GET_LABEL_BY_ID_QUERY = `
    query GetLabelById($id: Int!) {
        getLabelById(id: $id) {
            id
            name
            status
            prompts {
                id
                topic
            }
        }
    }
`;

describe('Label Mutations', () => {
    let adminToken;
    let userToken;
    let regularUser;

    beforeEach(async () => {
        await db.PromptLabel.destroy({ where: {} });
        await db.Prompt.destroy({ where: {} });
        await db.Label.destroy({ where: {} });
        await db.User.destroy({ where: {} });

        const admin = await createTestUser({
            username: 'admin',
            password: 'pass123',
            role: 'admin',
        });
        adminToken = admin.token;
        adminUser = admin.user;

        const user = await createTestUser({
            username: 'regularuser',
            password: 'user123',
            role: 'user',
        });
        userToken = user.token;
        regularUser = user.user;
    });

    test('Should allow admin to approve a label', async () => {
        const label = await db.Label.create({ name: 'TypeScript', status: 'pending' });

        const response = await graphqlRequest(
            app,
            VALIDATE_LABEL_MUTATION,
            { id: label.id, status: 'approved' },
            adminToken
        );

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.validateLabel.status).toBe('approved');

        const updatedLabel = await db.Label.findByPk(label.id);
        expect(updatedLabel.status).toBe('approved');
    });

    test('Should allow admin to reject a label and delete associated prompt', async () => {
        const label = await db.Label.create({ name: 'BadLabel', status: 'pending' });
        const prompt = await db.Prompt.create({
            topic: 'Test Prompt',
            content: 'Test Content',
            state: 'pending_approval',
            createdByUserId: regularUser.id,
        });
        await db.PromptLabel.create({
            promptId: prompt.id,
            labelId: label.id,
        });

        const response = await graphqlRequest(
            app,
            VALIDATE_LABEL_MUTATION,
            { id: label.id, status: 'rejected' },
            adminToken
        );

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.validateLabel.status).toBe('rejected');
        const deletedPrompt = await db.Prompt.findByPk(prompt.id);
        expect(deletedPrompt).toBeNull();
        const association = await db.PromptLabel.findOne({
            where: { labelId: label.id }
        });
        expect(association).toBeNull();
    });

    test('Should change prompt state to posted when all labels are approved', async () => {
        const label1 = await db.Label.create({ name: 'Label1', status: 'pending' });
        const label2 = await db.Label.create({ name: 'Label2', status: 'pending' });
        const prompt = await db.Prompt.create({
            topic: 'Test Prompt',
            content: 'Test Content',
            state: 'pending_approval',
            createdByUserId: regularUser.id,
        });
        await db.PromptLabel.create({ promptId: prompt.id, labelId: label1.id });
        await db.PromptLabel.create({ promptId: prompt.id, labelId: label2.id });

        await graphqlRequest(
            app,
            VALIDATE_LABEL_MUTATION,
            { id: label1.id, status: 'approved' },
            adminToken
        );

        let updatedPrompt = await db.Prompt.findByPk(prompt.id);
        expect(updatedPrompt.state).toBe('pending_approval');

        await graphqlRequest(
            app,
            VALIDATE_LABEL_MUTATION,
            { id: label2.id, status: 'approved' },
            adminToken
        );
        updatedPrompt = await db.Prompt.findByPk(prompt.id);
        expect(updatedPrompt.state).toBe('posted');
    });

    test('Should fail when non-admin tries to validate label', async () => {
        const label = await db.Label.create({ name: 'Angular', status: 'pending' });

        const response = await graphqlRequest(
            app,
            VALIDATE_LABEL_MUTATION,
            { id: label.id, status: 'approved' },
            userToken
        );

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toContain('Unauthorized');
    });

    test('Should get label by ID with associated prompts', async () => {
        const label = await db.Label.create({ name: 'JavaScript', status: 'approved' });
        const prompt = await db.Prompt.create({
            topic: 'JS Prompt',
            content: 'JS Content',
            state: 'posted',
            createdByUserId: regularUser.id,
        });
        await db.PromptLabel.create({ promptId: prompt.id, labelId: label.id });

        const response = await graphqlRequest(
            app,
            GET_LABEL_BY_ID_QUERY,
            { id: label.id }
        );

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.getLabelById.name).toBe('JavaScript');
        expect(response.body.data.getLabelById.prompts).toHaveLength(1);
        expect(response.body.data.getLabelById.prompts[0].topic).toBe('JS Prompt');
    });
});
