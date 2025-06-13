import { Type } from '@fastify/type-provider-typebox';
import { FastifyRequest, RouteGenericInterface } from 'fastify';
import { Static } from '@fastify/type-provider-typebox';

export const IdParamSchema = Type.Object({
    id: Type.String({ format: 'uuid' })
});