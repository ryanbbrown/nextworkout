import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
    await fastify.register(swagger, {
        openapi: {
            info: {
                title: 'NextWorkout API',
                description: 'NextWorkout API documentation',
                version: '1.0.0'
            },
            tags: [
                { name: 'workouts', description: 'Workout related endpoints' },
                { name: 'exercises', description: 'Exercise related endpoints' },
                { name: 'exercise-groups', description: 'Exercise group related endpoints' }
            ]
        }
    });

    await fastify.register(swaggerUi, {
        routePrefix: '/documentation'
    });
};

export default fp(swaggerPlugin, {
    name: 'swagger'
}); 