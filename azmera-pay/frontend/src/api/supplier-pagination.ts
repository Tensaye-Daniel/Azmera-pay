export function supplierListingApiPath(
  nextPage: string,
  listingEndpoint: string,
  apiBasePath = '/api/v1',
): string {
  const pageUrl = new URL(nextPage, listingEndpoint)
  if (!pageUrl.pathname.startsWith(`${apiBasePath}/`)) {
    throw new Error('Supplier listing pagination returned a URL outside the API.')
  }

  return `${pageUrl.pathname.slice(apiBasePath.length)}${pageUrl.search}`
}
