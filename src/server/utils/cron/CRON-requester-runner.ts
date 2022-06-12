import axios from 'axios'
import cron from 'node-cron'
import { getRandomInteger } from '~/utils/getRandomInteger'

const p1 = () => axios
  .post('http://selection4test.ru:1338/graphql', {
    query: `{
      remonts(sort: "updatedAt:DESC"){
        id
        name
        updatedAt
        owners { id }
        executors { id }
      }
    }`,
  })
  .then((res) => res.data)
  .catch((err) => err);
const p2 = () => axios
  .get('http://code-samples.space/api/notes?limit=7')
  .then((res) => res.data)
  .catch((err) => err);
const p3 = () => axios
  .post('http://pravosleva.ru/api/graphql', {
    query: `{
      projects: pages(
        sort: "createdAt:DESC"
        where: { type: "project" }
      ) {
        id
        shortName
        metadata {
          shareImage { url }
          metaDescription
        }
        updatedAt
        createdAt
        type
      }
      articles: pages(
        sort: "createdAt:DESC"
        where: { type: "article" }
      ) {
        id
        shortName
        metadata {
          shareImage { url }
          metaDescription
        }
        updatedAt
        createdAt
        type
      }
    }`,
  })
  .then((res) => res.data)
  .catch((err) => err);

const baseFn = () => {
  Promise.all([
    p1(),
    p2(),
    p3(),
  ])
    .then((values) => {
      console.log(values);
      // Array of fulfills (if no one rejected! else catch below)
    })
    .catch((err) => {
      console.log(err);
      // First rejection only
    });
}

cron.schedule(`${getRandomInteger(30, 59)} 15 * * *` /* Every day at 15:(30-59) */, function() {
  baseFn()
})
