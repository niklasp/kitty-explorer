import cache from "memory-cache";
import jsonData from './latest-kitties.json';

const NFT_BY_ID_ENDPOINT = 'http://138.68.123.124/get_nft_by_id/';

const IPFS_PROVIDERS = [
  'cloudflare-ipfs.com',
  'gateway.ipfs.io',
  'ipfs.io'
]

export function getSortedKittiesData() {
  let forSaleCount = 0;
  let floorKitties = {
    kitties:[],
    price: Number.MAX_SAFE_INTEGER,
  };

  const realKittyData = jsonData.map( ( kitObj ) => {
    const {
      id,
      metadata,
      forsale,
      ...rest
    } = kitObj;

    const parsedMeta = JSON.parse( metadata );
    let mediaUri;
    if ( ! parsedMeta.thumbnailUri ) {
      mediaUri = parsedMeta.mediaUri.replace("ipfs://", "https://gateway.ipfs.io/");
    } else {
      mediaUri = parsedMeta.thumbnailUri.replace("ipfs://", "https://gateway.ipfs.io/");
    }

    const kittyId = id.slice(-3);
    const description = parsedMeta.description;
    if ( forsale !== '0' ) {
      forSaleCount++;

      if ( parseInt(forsale) < floorKitties.price ) {
        floorKitties.kitties = [ { ...kitObj, uuid: kitObj.id, id:kittyId } ];
        floorKitties.price = parseInt(forsale);
      } else if ( parseInt(forsale) === floorKitties.price ) {
        floorKitties.kitties.push( { ...kitObj, uuid: kitObj.id, id:kittyId } );
      }
    }

    return {
      uuid: id,
      id: kittyId,
      mediaUri,
      description,
      forsale,
      ...rest
    }
  })

  return {
    forSaleCount: forSaleCount,
    floorKitties,
    data: realKittyData.sort(( { id:a }, { id: b }) => {
      if (a < b) {
        return 1;
      } else if (a > b) {
        return -1;
      } else {
        return 0;
      }
    })
  };
}

export async function getKittyDetail( uuid ) {
  const cachedResponse = cache.get( uuid );
  if (cachedResponse) {
    return cachedResponse;
  } else {
    const hours = 24;
    const response = await fetch(`${ NFT_BY_ID_ENDPOINT }${ uuid }` );
    const data = await response.json();
    cache.put(uuid, data, hours * 1000 * 60 * 60);

    const {
      id,
      metadata,
      ...rest
    } = data;

    const kittyId = id.slice(-3);

    try {
      const parsedMeta = JSON.parse( metadata );
      const mediaUri = parsedMeta.mediaUri.replace("ipfs://", "https://gateway.ipfs.io/");

      return {
        uuid: id,
        id: kittyId,
        mediaUri,
        description,
        forsale,
        ...parsedMeta,
        ...rest
      }
    } catch( e ) {
      return {
        uuid: id,
        id: kittyId,
        ...rest
      }
    }
  }
}
