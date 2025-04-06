import { randomUUID } from 'node:crypto'
import { isRight, unwrapEither } from '@/shared/either'
import { makeUpload } from '@/test/factories/make-upload'
import dayjs from 'dayjs'
import { describe, expect, it, vi } from 'vitest'
import { getUploads } from './get-uploads'

describe('get uploads', () => {
  it('should be able to get uploads', async () => {
    const namePattern = randomUUID()

    const upload1 = await makeUpload({ name: `${namePattern}.webp` })
    const upload2 = await makeUpload({ name: `${namePattern}.jpg` })
    const upload3 = await makeUpload({ name: `${namePattern}.png` })
    const upload4 = await makeUpload({ name: `${namePattern}.pdf` })

    const sut = await getUploads({
      searchQuery: namePattern,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut).total).toEqual(4)
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({
        id: upload4.id,
      }),
      expect.objectContaining({
        id: upload3.id,
      }),
      expect.objectContaining({
        id: upload2.id,
      }),
      expect.objectContaining({
        id: upload1.id,
      }),
    ])
  })

  it('should be able to get uploads with pagination', async () => {
    const namePattern = randomUUID()

    const upload1 = await makeUpload({ name: `${namePattern}.webp` })
    const upload2 = await makeUpload({ name: `${namePattern}.jpg` })
    const upload3 = await makeUpload({ name: `${namePattern}.png` })
    const upload4 = await makeUpload({ name: `${namePattern}.pdf` })

    // Get first page
    let sut = await getUploads({
      page: 1,
      pageSize: 3,
      searchQuery: namePattern,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut).total).toEqual(4)
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({
        id: upload4.id,
      }),
      expect.objectContaining({
        id: upload3.id,
      }),
      expect.objectContaining({
        id: upload2.id,
      }),
    ])

    // Get second page
    sut = await getUploads({
      page: 2,
      pageSize: 3,
      searchQuery: namePattern,
    })
    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut).total).toEqual(4)
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({
        id: upload1.id,
      }),
    ])
  })

  it('should be able to get sorted uploads', async () => {
    const namePattern = randomUUID()

    const upload1 = await makeUpload({
      name: `${namePattern}.webp`,
      createdAt: new Date(),
    })
    const upload2 = await makeUpload({
      name: `${namePattern}.jpg`,
      createdAt: dayjs().subtract(1, 'day').toDate(),
    })
    const upload3 = await makeUpload({
      name: `${namePattern}.png`,
      createdAt: dayjs().subtract(2, 'day').toDate(),
    })
    const upload4 = await makeUpload({
      name: `${namePattern}.pdf`,
      createdAt: dayjs().subtract(3, 'day').toDate(),
    })

    // Descending order
    let sut = await getUploads({
      searchQuery: namePattern,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut).total).toEqual(4)
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({
        id: upload1.id,
      }),
      expect.objectContaining({
        id: upload2.id,
      }),
      expect.objectContaining({
        id: upload3.id,
      }),
      expect.objectContaining({
        id: upload4.id,
      }),
    ])

    // Ascending order
    sut = await getUploads({
      searchQuery: namePattern,
      sortBy: 'createdAt',
      sortDirection: 'asc',
    })
    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut).total).toEqual(4)
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({
        id: upload4.id,
      }),
      expect.objectContaining({
        id: upload3.id,
      }),
      expect.objectContaining({
        id: upload2.id,
      }),
      expect.objectContaining({
        id: upload1.id,
      }),
    ])
  })
})
