import { z } from "zod";

type Schema<Query extends z.ZodObject, Body extends z.ZodObject, Params extends z.ZodObject> = {
    querySchema: Query;
    bodySchema: Body;
    paramsSchema: Params;
};

type Props<Query extends z.ZodObject, Body extends z.ZodObject, Params extends z.ZodObject> = {
    schema: Schema<Query, Body, Params>;
    req: Request;
};

type parseWithSchemaType<Schema extends z.ZodObject> = {
    data: unknown;
    schema: Schema;
};

/**
 * Parses data using a Zod schema and returns the inferred type.
 * @template Schema - The Zod schema type
 * @param {Object} args - The arguments object
 * @param {unknown} args.data - The data to validate
 * @param {Schema} args.schema - The Zod schema to use
 * @returns {z.infer<Schema>} - The validated and typed data
 */
export const parseWithSchema = <Schema extends z.ZodObject<any>>({
    data,
    schema,
}: parseWithSchemaType<Schema>): z.infer<Schema> => {
    return schema.parse(data);
};

/**
 * Validates route data (query, body, params) using provided Zod schemas.
 * Designed for use in React Router loaders/actions or similar server handlers.
 *
 * @template Query - ZodObject for query validation
 * @template Body - ZodObject for body validation
 * @template Params - ZodObject for params validation
 * @param {Object} args - The arguments object
 * @param {{ querySchema: Query; bodySchema: Body; paramsSchema: Params }} args.schema - The schemas for validation
 * @param {unknown} args.reqQuery - The query data to validate
 * @param {unknown} args.reqBody - The body data to validate
 * @param {unknown} args.reqParams - The params data to validate
 * @returns {{ query: z.infer<Query>; body: z.infer<Body>; params: z.infer<Params> }} - The validated and typed data
 *
 * @example
 *   const result = validateRequest({
 *     schema: { querySchema, bodySchema, paramsSchema },
 *     reqQuery: request.query,
 *     reqBody: request.body,
 *     reqParams: request.params,
 *   });
 */
export function validateRequest<
    Query extends z.ZodObject<any> = any,
    Body extends z.ZodObject<any> = any,
    Params extends z.ZodObject<any> = any
>(args: {
    schema: {
        querySchema?: Query;
        bodySchema?: Body;
        paramsSchema?: Params;
    };
    reqQuery?: unknown;
    reqBody?: unknown;
    reqParams?: unknown;
}): Partial<{
    query: z.infer<Query>;
    body: z.infer<Body>;
    params: z.infer<Params>;
}> {
    const { schema, reqQuery, reqBody, reqParams } = args;
    const { querySchema, bodySchema, paramsSchema } = schema;
    const result: any = {};
    if (querySchema) {
        result.query = parseWithSchema({ data: reqQuery, schema: querySchema });
    }
    if (bodySchema) {
        result.body = parseWithSchema({ data: reqBody, schema: bodySchema });
    }
    if (paramsSchema) {
        result.params = parseWithSchema({ data: reqParams, schema: paramsSchema });
    }
    return result;
}
