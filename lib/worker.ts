require('dotenv').config()

// import { getLastBlockScanned, setLastBlockScanned } from "../store/last_block";
import { Consolidator, RemarkListener } from 'rmrk-tools';
import prisma from '../lib/prisma';
// import {addNft, getNft, getNftIdsClaimingChild, removeOwner} from "../store/nft"
// import { addCollection } from "../store/collection"
// import { addBase } from "../store/base"

import { InMemoryAdapter } from './in-memory-adapter';
import { Remark } from "rmrk-tools/dist/tools/consolidator/remark";
import uniq from 'uniq'
import { getConnection } from "./connection";
import tar from 'tar-fs'
const fs = require('fs')
const https = require('https')
const zlib = require('zlib')

let lastKnownBlock = 0;


const watchBuyOps = async rmrks => {
  // console.log( 'watchBuyOps', rmrks );
  const buyOps = rmrks.filter(rmrk => rmrk.interaction_type === 'BUY' || rmrk.interaction_type === 'LIST' )
  
  let currentTime = Date.now()
  // console.log( currentTime, buyOps );
  for(const rmrk of buyOps) {
    console.log( 'rmrk in buyOps', rmrk );
      let remark = rmrk.remark
          .split('::')
      if(remark.length < 4) {
          continue;
      }
      if(!rmrk.extra_ex) {
          continue;
      }
      let extra_ex = rmrk.extra_ex
          .filter(ex => ex.call === 'balances.transfer')
      if(extra_ex.length < 1) {
          continue
      }
      let { value } = extra_ex[0]
      let nftId = remark[3]


      // let nft = await 

      // if(!nft) {
      //     continue
      // }
      // let forSale = BigInt(nft.forsale)
      // let pricePaid = BigInt(value.split(',')[1])
      // if(forSale <= 0 || pricePaid < forSale) {
      //     continue
      // }
      // PendingBuyNfts[nftId] = currentTime
  }
}

const readConsolidatedFileIntoMemoryAndSaveToDb = async fileName => {
  console.log(`Reading File: ${fileName}`);
  const file = JSON.parse(
      fs.readFileSync(fileName, 'utf8')
  );

  // @ts-ignore
  const { lastBlock, nfts, collections, bases } = file;
  console.log('Recreating State From Dump, Last Block: ' + lastBlock);

  const dbLastKnownBlock = 0;
  if(dbLastKnownBlock < lastBlock) {
      console.log('Inserting Latest RMRK Dump Into DB, this could take a while...')

      // console.log('Importing Bases')
      // await addBase(bases)

      // console.log('Importing Collections')
      // await addCollection(collections)

      console.log('Importing Nfts')
      let kittyCount = 0;
      for (const [key, value] of Object.entries(nfts)) {
        if ( ! key.includes( 'KITTY-KITTY_PARADISE') ) {
          continue;
        }

        kittyCount++;
        // @ts-ignore
        console.log(`${key}: ${ value.forsale }, ${ value.description }, ${ value.metadata }`);

        // @ts-ignore
        const result = await prisma.NFT.upsert({
          where: {
            // @ts-ignore
            token_id: value.id.slice(-3),
          },
          update: {},
          create: {
            // @ts-ignore
            token_id: value.id.slice(-3),
            // @ts-ignore
            forsale: value.forsale,
            // @ts-ignore
            metadata_uri: value.metadata,
          },
      });
      }
      console.log( 'total found kitties:', kittyCount );


      // await setLastBlockScanned(lastBlock)
      // console.log('...Done')
  }
  return ({ lastBlock: lastBlock + 1, nfts, collections, bases });
}

const initialSeed = () => {
  return new Promise(async res => {
      try {
          const dumpUrl = process.env.RMRKDUMP ? process.env.RMRKDUMP : null
          const isTarball = process.env.RMRKDUMPISTAR ? process.env.RMRKDUMPISTAR === 'true' : false
          const isGzip = process.env.RMRKDUMPISGZ ? process.env.RMRKDUMPISGZ === 'true' : false

          if(!dumpUrl) {  //No dump, start syncing from block 0
              console.log(`No Dump to Fetch, begin syncing from block 0...`)
              lastKnownBlock = 0;
              return { lastBlock:  0, nfts: {}, collections: {}, bases: {} };
          }
          console.log(`Fetching Latest RMRK Dump: <${dumpUrl}> (.tar? ${isTarball} , .gz? ${isGzip})...`)
          https.get(dumpUrl, response => {
              const stream = fs.createWriteStream("./rmrk-dump.file")
              response.pipe(stream)
              stream.on('open', () => {
                  console.log('Began Downloading')
              })
              stream.on("finish", () => {
                  console.log(`Download Completed! Read ${stream.bytesWritten/1000000} MB!`);
                  let file = fs.readFileSync('./rmrk-dump.file')

                  if(isGzip) {
                      console.log('Began Unzipping File')
                      file = zlib.gunzipSync(file)
                      fs.writeFileSync('./rmrk-dump.file.unzipped', file)
                      console.log('Finished Unzipping!')
                  }

                  if(isTarball) {
                      console.log('Began Extracting')
                      let readStream = fs.createReadStream('./rmrk-dump.file.unzipped')
                      const extract = tar.extract('.')
                      readStream.pipe(extract)
                      let fileName
                      extract.on('entry', function(header, stream, next) {    //Assuming there is only 1 file in this tarball
                          fileName = header.name
                          stream.on('end', function() {
                              next() // ready for next entry
                          })
                      })
                      extract.on('error', data => {
                          console.error(data)
                          process.exit(0)
                      })
                      extract.on('finish', async () => {
                          console.log('Finished Extracting!')
                          return res(readConsolidatedFileIntoMemoryAndSaveToDb(fileName));
                      })
                  } else {    //not a tarball, just read the file
                      return res(readConsolidatedFileIntoMemoryAndSaveToDb('./rmrk-dump.file.unzipped'));
                  }
              });
          })
      } catch(error) {
          console.error(`Error Fetching Initial Seed Dump! --- ${error}`)
          process.exit(-1)
      }
  })
}


const startBlockScanner = async () => {
  // @ts-ignore
  let { lastBlock, nfts, collections, bases} = await initialSeed();
  console.log(`Starting RMRK Listener from block.(${lastBlock})...`)
  const adapter = new InMemoryAdapter(nfts, collections, bases);
  // const storageProvider = new StorageProvider(lastBlock);
  const RMRK_PREFIXES = ['0x726d726b', '0x524d524b'];
  const api = await getConnection(process.env.WSURL);

  const consolidateFunction = async (remarks) => {
      const rmrkBlocks = uniq(remarks.map((r) => r.block));
      if(rmrkBlocks.length > 0) {
          lastBlock = Math.max(...rmrkBlocks)
      }
      const consolidator = new Consolidator(2, adapter, true, true);
      const result = await consolidator.consolidate(remarks);
      const interactionChanges = result.changes || [];
      // SYNC to DB interactionChanges

      const affectedIds = interactionChanges?.length
          ? interactionChanges.map((c) => Object.values(c)).flat()
          : [];
      // console.log(affectedIds)

      let updatedNfts = result.nfts
      let updatedBases = result.bases
      let updatedColls = result.collections

      // console.log( updatedNfts, updatedColls );

      let affectedNfts = {},
          affectedCollections = {},
          affectedBases = {},
          affectedInvalids = []


      let keysToKeep = Object.keys(updatedNfts)
      keysToKeep = keysToKeep.filter(key => affectedIds.includes(key))

      // for(const key of keysToKeep) {
      //     affectedNfts[key] = updatedNfts[key]
      //     let ownerId = updatedNfts[key].owner
      //     if(ownerId) {
      //         if(updatedNfts.hasOwnProperty(ownerId)) {
      //             affectedNfts[ownerId] = updatedNfts[ownerId]
      //         }
      //         let lastKnownOwner = await getNftIdsClaimingChild(key)
      //         if(lastKnownOwner) {
      //             if(lastKnownOwner !== ownerId) {
      //                 await removeOwner(key, lastKnownOwner)
      //             }
      //         }
      //     }
      // }

      keysToKeep = Object.keys(updatedColls)
      keysToKeep = keysToKeep.filter(key => affectedIds.includes(key))
      for(const key of keysToKeep) {
          affectedCollections[key] = updatedColls[key]
      }

      keysToKeep = Object.keys(updatedBases)
      keysToKeep = keysToKeep.filter(key => affectedIds.includes(key))
      for(const key of keysToKeep) {
          affectedBases[key] = updatedBases[key]
      }

      console.log(`Scanned Blocks ${lastKnownBlock} ---> ${lastBlock}`)
      // //await addInvalid(affectedInvalids, block)
      // await addBase(affectedBases)
      // await addCollection(affectedCollections)
      // await addNft(affectedNfts, lastKnownBlock)
      if(lastBlock > 0) {
          lastKnownBlock = lastBlock;
      }

      // console.log( 'result of consolidation', result );
      return result;
  };

  const listener = new RemarkListener({
      polkadotApi: api,
      prefixes: RMRK_PREFIXES,
      consolidateFunction,
  });

  const subscriber = listener.initialiseObservable();
  const unfinalizedSubscriber = listener.initialiseObservableUnfinalised();

  subscriber.subscribe();
  unfinalizedSubscriber.subscribe(async (rmrks) => await watchBuyOps(rmrks) );

  console.log('...RMRK Listener Subscribed and Listening')
}

const doWork = async () => {
  console.log( 'working' );
  const a = await startBlockScanner();
}

doWork();


