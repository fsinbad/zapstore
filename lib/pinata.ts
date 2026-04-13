const PINATA_JWT = process.env.PINATA_JWT!
const GATEWAY_URL = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL!

interface PinataUploadResult {
  cid: string
  url: string
}

/**
 * Upload a file to IPFS via Pinata.
 * Used for public assets: cover images, preview images, avatars.
 */
export async function uploadToIPFS(
  file: File,
  name?: string,
): Promise<PinataUploadResult> {
  const formData = new FormData()
  formData.append('file', file)

  const metadata = JSON.stringify({
    name: name || file.name,
    keyvalues: { app: 'zapstore' },
  })
  formData.append('pinataMetadata', metadata)

  const options = JSON.stringify({ cidVersion: 1 })
  formData.append('pinataOptions', options)

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Pinata upload failed: ${error}`)
  }

  const data = await res.json()
  const cid = data.IpfsHash as string

  return {
    cid,
    url: `${GATEWAY_URL}/ipfs/${cid}`,
  }
}

/**
 * Build a public IPFS URL from a CID using our Pinata gateway.
 */
export function ipfsUrl(cid: string): string {
  return `${GATEWAY_URL}/ipfs/${cid}`
}
