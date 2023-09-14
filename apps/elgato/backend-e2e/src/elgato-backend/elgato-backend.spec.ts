import axios from 'axios'

describe('GET /api', () => {
  it('should return 200 for index', async () => {
    const res = await axios.get(`/api`)

    expect(res.status).toBe(200)
  })
})
