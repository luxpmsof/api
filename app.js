// app.js (아래 검색서버 IP와 apiKey는 반드시 변경 해 주셔야 합니다.)
const httpErrors = require('http-errors')
const Typesense = require('typesense')
const fastifyStatic = require('fastify-static')
const path = require('path')
const typesenseClient = new Typesense.Client({
  nodes: [{
    host: 'www.devkids.co.kr', // 반드시 변경 해 주세요
    port: '14407',
    protocol: 'http'
  }],
  apiKey: 'TnOoinsCNDCGkd1kVbKaCyiZEdKY0ACAISQkj8V0qghZhWRu', // 반드시 변경 해 주세요
  connectionTimeoutSeconds: 2
})

const fastify = require('fastify')({ trustProxy: true })

// cors 허용을 위한 플러그인 등록
fastify.register(require('fastify-cors'))
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '/')
})

// routes에 추가
fastify.get('/search/address', async function (request, reply) {
  const { keyword } = request.query
  if (!keyword) return reply.send(httpErrors.BadRequest('keyword is required'))

  // 검색 서버로 질의 및 응답용 결과 가공
  const searchParameters = { q: keyword, query_by: 'name', per_page: 10 }
  const searchResults = await typesenseClient.collections('singer').documents().search(searchParameters)
  const result = searchResults.hits.map((res) => (res.highlights[0] || {}).snippet || res.document.id)
  return reply.send(result)
})

fastify.get('/', async function (request, reply) {

  return reply.sendFile('index.html')
})


fastify.get('/search/add', async function (request, reply) {
  const { keyword } = request.query
  if (!keyword) return reply.send(httpErrors.BadRequest('keyword is required'))

  // 검색 서버로 질의 및 응답용 결과 가공
  const searchParameters = { q: keyword, query_by: 'name', per_page: 10 }

  let document = {
  'name': keyword,
    }

  await typesenseClient.collections('singer').documents().create(document)
  const searchResults = await typesenseClient.collections('singer').documents().search(searchParameters)
  const result = searchResults.hits.map((res) => (res.highlights[0] || {}).snippet || res.document.id)
  return reply.send(result)
})


// API 서버 실행
fastify.listen(3000, (err, address) => {
  if (err) throw err
  fastify.log.info(`server listening on ${address}`)
})
