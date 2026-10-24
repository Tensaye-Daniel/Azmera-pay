import assert from 'node:assert/strict'
import test from 'node:test'

import { supplierListingApiPath } from '../src/api/supplier-pagination.ts'

const listingEndpoint =
  'http://localhost:5173/api/v1/catalog/supplier/listings'

test('initial listing URL stays under the Axios API base path', () => {
  assert.equal(
    supplierListingApiPath(
      '/api/v1/catalog/supplier/listings',
      listingEndpoint,
    ),
    '/catalog/supplier/listings',
  )
})

test('relative DRF next URL preserves its query string', () => {
  assert.equal(
    supplierListingApiPath(
      '/api/v1/catalog/supplier/listings?page=2',
      listingEndpoint,
    ),
    '/catalog/supplier/listings?page=2',
  )
})

test('absolute DRF next URL is converted to an Axios API path', () => {
  assert.equal(
    supplierListingApiPath(
      'http://localhost:8000/api/v1/catalog/supplier/listings?page=3',
      listingEndpoint,
    ),
    '/catalog/supplier/listings?page=3',
  )
})

test('pagination URLs outside the API are rejected', () => {
  assert.throws(
    () => supplierListingApiPath('/catalog/supplier/listings', listingEndpoint),
    /outside the API/,
  )
})
