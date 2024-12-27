import {
  extendType,
  nonNull,
  intArg,
  objectType,
  stringArg,
  list,
  idArg,
} from "nexus";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
  },
});

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve(parent, args, context, info) {
        return context.prisma.link.findMany();
      },
    });
    t.nonNull.field("link", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
      },

      async resolve(parent, args, context) {
        const link = await context.prisma.link.findUnique({
          where: {
            id: parseInt(args.id),
          },
        });
        if (!link) throw new Error(`No link found for id: ${args.id}`);
        return link;
      },
    });
  },
});

export const LinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Link",
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },

      async resolve(parent, args, context) {
        const newLink = await context.prisma.link.create({
          data: {
            description: args.description,
            url: args.url,
          },
        });
        return newLink;
      },
    });
    t.nonNull.field("updateLink", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
        url: stringArg(),
        description: stringArg(),
      },

      async resolve(parent, args, context) {
        const link = await context.prisma.link.update({
          where: {
            id: parseInt(args.id),
          },
          data: {
            description: args.description ?? undefined,
            url: args.url ?? undefined,
          },
        });
        return link;
      },
    });
    t.nonNull.field("deleteLink", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
      },

      async resolve(parent, args, context) {
        return await context.prisma.link.delete({
          where: {
            id: parseInt(args.id),
          },
        });
      },
    });
  },
});
