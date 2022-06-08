import { orderBy } from "lodash";
import jsonData from './kitties.json';

export async function getKitties() {

  // transform the data we get from the json to a format we want
  const realKittyData = jsonData.map( ( kitObj ) => {
    const {
      id,
      metadata,
      forsale,
    } = kitObj;

    let parsedMeta = {};

    // parse the metadata: string -> json
    try {
      metadata.slice(1, -1);
      parsedMeta = JSON.parse( metadata );
    } catch( e ) {
      console.log( 'error parsing metadata for ', kitObj.id );
    }

    // use some ipfs gateways to transform the media uri to a URL to the image
    // (nextjs will cache those requests so you should be safe from timeouts)
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

  // sort the data by id desc
  const sortedData = orderBy( realKittyData, item => item[ 'id' ], [ 'desc' ]);

  return {
    kitties: sortedData,
  };
}
