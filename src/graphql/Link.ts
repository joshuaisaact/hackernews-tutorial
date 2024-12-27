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
    t.nonNull.dateTime("createdAt");
    t.field("postedBy", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .postedBy();
      },
    });
    t.nonNull.list.nonNull.field("voters", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .voters();
      },
    });
  },
});

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      args: {
        filter: stringArg(),
      },
      resolve(parent, args, context) {
        const where = args.filter
          ? {
              OR: [
                { description: { contains: args.filter } },
                { url: { contains: args.filter } },
              ],
            }
          : {};
        return context.prisma.link.findMany({
          where,
        });
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
        const { description, url } = args;
        const { userId } = context;

        if (!userId) {
          throw new Error("Cannot post without logging in");
        }

        const newLink = await context.prisma.link.create({
          data: {
            description,
            url,
            postedBy: { connect: { id: userId } },
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
        const { userId } = context;

        if (!userId) {
          throw new Error("Cannot delete without logging in");
        }

        const link = await context.prisma.link.findUnique({
          where: { id: parseInt(args.id) },
        });

        if (link?.postedById !== userId) {
          throw new Error("Not authorized to delete this link");
        }

        return context.prisma.link.delete({
          where: { id: parseInt(args.id) },
        });
      },
    });
  },
});
