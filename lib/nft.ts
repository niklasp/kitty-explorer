import fetch, { Headers } from 'node-fetch'
const R = require('ramda');

export const addNftMetadata = async (nftId, index,  metadataString) => {
  try {
      const insert = "UPDATE nfts_2 SET metadata=$1 " +
          " WHERE id=$2;";
      let metadata = ''
      try {
          if(!metadataString) {
              return 0
          }
          if(metadataString.length < 32) {
              return 0
          }
          let metadataArray = metadataString.split('ipfs/')
          let ipfsOrHttps = metadataArray[0] === 'ipfs://'    //Some metadatas are https:// links, we need to simply GET them
          if(metadataArray.length < 1) {
              console.error(`Metadata is not ipfs: ${metadataString}`)
              return 0
          }
          metadataArray = metadataArray.slice(1)  //['ipfs://', 'ba...']
          metadata = metadataArray[0]
          if(metadata[0] !== 'Q' && metadata[0] !== 'b') {
              console.error(`Strange Metadata: ${metadataString} - ${JSON.stringify(metadataArray)} - ${metadata}`)
              return 0
          }

          let response

          if(!ipfsOrHttps) {
              // @ts-ignore
              response = await fetch(metadataString, {
                  method: 'GET'
              });
          } else {
              const usePaidGateway = process.env.IPFSUSEPAID ? process.env.IPFSUSEPAID : false;

              if(usePaidGateway) {
                  const userAgent = process.env.IPFSPAIDUSERAGENT
                  const gateway = process.env.IPFSPAIDGATEWAY
                  const method = process.env.IPFSPAIDMETHOD
                  const host = process.env.IPFSPAIDHOST
                  const projectId = process.env.IPFSPAIDPROJECTID
                  const projectSecret = process.env.IPFSPAIDSECRET

                  const headers = new Headers()
                  headers.set('Authorization', 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64'))
                  headers.set('User-Agent', userAgent)
                  headers.set('Host', host)
                  headers.set('Content-Type', 'application/json')

                  // @ts-ignore
                  response = await fetch(`${gateway}${metadata}`,
                      {
                          method,
                          headers
                      }
                  );
              } else {
                  const gateways = process.env.IPFSGATEWAY.split(',')
                  const gateway = gateways[   //choose a random gateway
                      Math.floor(
                      Math.random() * gateways.length
                  )
                  ]
                  response = await fetch(`${gateway}/${metadata}`)
              }
          }

          metadata = await response.text();
          let insertionValues = [
              metadata,
              nftId,
          ]

          //todo update the database entry with fetchedMetadata = 1;
          //await setNftMetadataFetched(nftId);

          //TODO update the nft in the database
          //return await db_query(insert, insertionValues)

      } catch(error) {
          console.error(metadataString)
          console.error(error)
      }

      //Unable to fetch metadata, probably due to network or rate limit. Should try again at some point
  } catch(error) {
      console.error(`Error in addNftMetadata: ${error}`)
  }
}