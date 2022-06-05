import cache from "memory-cache";
import jsonData from './latest-kitties.json';

const NFT_BY_ID_ENDPOINT = 'http://138.68.123.124/get_nft_by_id/';

const IPFS_PROVIDERS = [
  'cloudflare-ipfs.com',
  'gateway.ipfs.io',
  'ipfs.io'
]

export async function getSortedKitties() {
  let forSaleCount = 0;
  let floorKitties = {
    kitties:[],
    price: Number.MAX_SAFE_INTEGER,
  };

  const response = await fetch("http://138.68.123.124/get_nfts_by_collection/800f8a914281765a7d-KITTY" );
  const data = await response.json();

  const realKittyData = data.map( ( kitObj ) => {
    const {
      id,
      metadata,
      forsale,
    } = kitObj;

    let parsedMeta = {};

    try {
      metadata.slice(1, -1);
      parsedMeta = JSON.parse( metadata );
    } catch( e ) {
      console.log( 'error parsing metadata for ', kitObj.id );
    }

    let mediaUri = '';
    if ( Object.keys( parsedMeta ).length > 0 ) {
      if ( ! parsedMeta.thumbnailUri ) {
        mediaUri = parsedMeta.mediaUri.replace("ipfs://", "https://gateway.ipfs.io/");
      } else {
        mediaUri = parsedMeta.thumbnailUri.replace("ipfs://", "https://gateway.ipfs.io/");
      }
    }

    const kittyId = id.slice(-3);

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
      forsale,
      metadata: {
        ...parsedMeta,
        mediaUri,
      }
    }
  });

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
