import {
  extendType,
  nonNull,
  intArg,
  objectType,
  stringArg,
  list,
  idArg,
} from "nexus";
import { NexusGenObjects } from "../../nexus-typegen";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
  },
});

let links: NexusGenObjects["Link"][] = [
  {
    id: 1,
    url: "www.howtographql.com",
    description: "Fullstack tutorial for GraphQL",
  },
  {
    id: 2,
    url: "graphql.org",
    description: "GraphQL official website",
  },
];

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve(parent, args, context, info) {
        return links;
      },
    });
    t.nonNull.field("link", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
      },

      resolve(parent, args, context) {
        const link = links.find((link) => link.id === parseInt(args.id));
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

      resolve(parent, args, context) {
        const { description, url } = args;

        let idCount = links.length + 1;
        const link = {
          id: idCount,
          description: description,
          url: url,
        };
        links.push(link);
        return link;
      },
    });
    t.nonNull.field("updateLink", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
        url: stringArg(),
        description: stringArg(),
      },

      resolve(parent, args, ctx) {
        const link = links.find((link) => link.id === parseInt(args.id));
        if (!link) throw new Error(`No link found for id: ${args.id}`);

        if (args.description) link.description = args.description;
        if (args.url) link.url = args.url;

        return link;
      },
    });
    t.nonNull.field("deleteLink", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
      },

      resolve(parent, args, ctx) {
        const link = links.find((link) => link.id === parseInt(args.id));
        if (!link) throw new Error(`No link found for id: ${args.id}`);

        links = links.filter((l) => l.id !== parseInt(args.id));

        return link;
      },
    });
  },
});
