import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (fastify) => {
    // Register route groups
    await fastify.register(import('./workouts.js'), { prefix: '/workouts' });
    // await fastify.register(import('./exercises.js'), { prefix: '/exercises' });
    // await fastify.register(import('./exerciseGroups.js'), { prefix: '/exercise-groups' });
};

export default routes; 