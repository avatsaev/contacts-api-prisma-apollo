import { nexusPrismaPlugin } from 'nexus-prisma'
import {  makeSchema, objectType, stringArg } from '@nexus/schema'

const Contact= objectType({
  name: 'Contact',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.email()
    t.model.phone()
  },
})


const Query = objectType({
  name: 'Query',
  definition(t) {
    t.crud.contact()
    t.crud.contacts()



    t.list.field('searchContacts', {
      type: 'Contact',
      args: {
        queryString: stringArg()
      },
      resolve: (_, { queryString }, ctx) => {
        return ctx.prisma.contact.findMany({
          where: {
            OR: [
              { name: { contains:  queryString} },
              { email: { contains: queryString } },
            ],
          },
        })
      },
    })
  },
})

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.crud.createOneContact()
    t.crud.deleteOneContact()
    t.crud.updateOneContact()
  },
})

export const schema = makeSchema({
  types: [Query, Mutation, Contact],
  plugins: [nexusPrismaPlugin()],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  typegenAutoConfig: {
    contextType: 'Context.Context',
    sources: [
      {
        source: '@prisma/client',
        alias: 'prisma',
      },
      {
        source: require.resolve('./context'),
        alias: 'Context',
      },
    ],
  },
})
