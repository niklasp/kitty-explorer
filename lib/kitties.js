import { orderBy } from "lodash";
import jsonData from './kitties.json';

export async function getKitties() {
  const realKittyData = jsonData.map( ( kitObj ) => {
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

  const sortedData = orderBy( realKittyData, item => item[ 'id' ], [ 'desc' ]);

  return {
    kitties: sortedData,
  };
}
