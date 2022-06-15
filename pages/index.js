import Head from 'next/head'
<<<<<<< Updated upstream
=======

import { filter } from "lodash";
import { useState, useEffect } from 'react';
import KittyGrid from '../components/kitty-grid';
import KittyInfo from '../components/kitty-info';
import KittySettings from '../components/kitty-settings';
>>>>>>> Stashed changes

import { gql } from "@apollo/client";
import client from "../apollo-client";

import KittyGrid from '../components/kitty-grid';

import { getKitties } from '../lib/kitties'

export async function getStaticProps() {
<<<<<<< Updated upstream
  const { data } = await client.query({
    query: gql`
      query {
        nftEntities(where: {collection: {id_eq: "800f8a914281765a7d-KITTY"}}) {
          sn
          name
          metadata
          price
          meta {
            image
            description
          }
          emotes {
            value
          }
        }
      }
    `,
  })

  console.log( data );
=======
  const { data, forSaleCount, floorKitties, timestamp } = await getKitties('id', 'desc');
>>>>>>> Stashed changes

  return {
    props: {
      allKitties: data,
<<<<<<< Updated upstream
    }
=======
      forSaleCount,
      floorKitties,
      timestamp,
    }
  }
}

export default function Home( { allKitties, forSaleCount, totalCount, floorKitties, timestamp } ) {
  const [ isInfoHidden, setInfoHidden ] = useState(true);
  const [ shownKitties, setShownKitties ] = useState( allKitties );
  const [ sort, setSort ] = useState( {
    sortBy: 'id',
    sortDir: 'desc',
  } );
  const [ kittyFilter, setKittyFilter ] = useState( 'all' );

  useEffect( async () => {
    let sortedKitties = getKittiesSorted( shownKitties, sort.sortBy, sort.sortDir );
    if ( kittyFilter === 'price' ) {
      sortedKitties = filter( sortedKitties, ( o ) => parseInt(o.price) !== 0 );
    }
    setShownKitties( sortedKitties );
    console.log( 'newkittyfilter', kittyFilter, sort );
    console.log( 'shownkitties0', shownKitties[0] );
  }, [ kittyFilter, sort ] )

  function handleInfoClick() {
    setInfoHidden( !isInfoHidden )
  }

  const onFilterClick = value => () => {
    setKittyFilter( value );
  }

  const onSortClick = value => () => {
    setSort( value );
>>>>>>> Stashed changes
  }
}

export default function Home( { allKitties } ) {
  return (
    <div className="container">
      <Head>
        <title>Kitty Paradise Explorer — 500 Kusama pixel art NFTs</title>
        <meta name="title" content="Kitty Paradise Explorer — 500 Kusama pixel art NFTs" />
        <meta name="description" content="Showcases all unique Kitty Paradise NFTs with options to buy or just look around. Made by Yumi, living on Kusama / Polkadot. Get yours now!" />

        <meta name="keywords" content="Kusama, NFT, Polkadot" />
        <meta name="author" content="Niklas P" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://metatags.io/" />
        <meta property="og:title" content="Kitty Paradise Explorer — 500 Kusama pixel art NFTs" />
        <meta property="og:description" content="Showcases all unique Kitty Paradise NFTs with options to buy or just look around. Made by Yumi, living on Kusama / Polkadot. Get yours now!" />
        <meta property="og:image" content="https://kitty-explorer.vercel.app/kitty-explorer.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://metatags.io/" />
        <meta property="twitter:title" content="Kitty Paradise Explorer — 500 Kusama pixel art NFTs" />
        <meta property="twitter:description" content="Showcases all unique Kitty Paradise NFTs with options to buy or just look around. Made by Yumi, living on Kusama / Polkadot. Get yours now!" />
        <meta property="twitter:image" content="https://kitty-explorer.vercel.app/kitty-explorer.png" />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
<<<<<<< Updated upstream
        <KittyGrid allKitties={ allKitties.nftEntities } />
=======
        <KittyGrid allKitties={ shownKitties } />
        {/* <button className="btn-about" onClick={ () => setInfoHidden( !isInfoHidden ) }>
          about
        </button> */}
        <KittySettings
          sort={ sort }
          filter={ kittyFilter }
          onFilterClick={ onFilterClick }
          onSortClick={ onSortClick }
        />
        <KittyInfo
          forSaleCount={ forSaleCount }
          totalCount={ totalCount }
          hidden={ isInfoHidden }
          handleClick={ handleInfoClick }
          floorKitties={ floorKitties }
          timestamp={ timestamp }
        />
>>>>>>> Stashed changes
      </main>
    </div>
  )
}
