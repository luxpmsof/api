// make-data.js
const Typesense = require('typesense')
const PublicGoogleSheetsParser = require('public-google-sheets-parser')
const parser = new PublicGoogleSheetsParser()

// collection 및 document 생성을 위한 client 준비
const client = new Typesense.Client({
  nodes: [{
    host: 'www.devkids.co.kr',
    port: '14407',
    protocol: 'http'
  }],
  apiKey: 'TnOoinsCNDCGkd1kVbKaCyiZEdKY0ACAISQkj8V0qghZhWRu', // 반드시 수정 해 주세요
  connectionTimeoutSeconds: 2
})

run = async() => {
  // collection 생성
  const collectionName = 'singer'
  const addressSchema = {
    'name': collectionName,
    'fields': [
      {'name': 'name', 'type': 'string' },
      {'name': 'index', 'type': 'int32' },

    ],
    'default_sorting_field': 'index'
  }
  await client.collections().create(addressSchema)


  // documents import 처리
  const rawAddress = await parser.parse('1wbRXuacGVqPU1XLt_jDqsdcyzDMVEyJ_ubYGh_Li924')
  console.log(rawAddress)
  const address = rawAddress.map(({ name }, index) => ({ name, index }))
  await client.collections(collectionName).documents().import(address, { action: 'create' })

  // documents가 잘 저장되었는지 테스트 쿼리 전송 및 결과 확인
  const searchParameters = {
    q: '김',
    query_by: 'name',
    per_page: 5,
  }
  const searchResult = await client.collections(collectionName).documents().search(searchParameters)
  console.log(searchResult)
}

run().then(()=>{console.log('done')});
