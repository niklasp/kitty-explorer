import Head from 'next/head'
import { orderBy } from 'lodash';
import KittyGrid from '../components/kitty-grid';

import { getKitties } from '../lib/kitties'

export async function getStaticProps() {
  const { kitties } = await getKitties();

  return {
    props: {
      allKitties: kitties,
    },
  }
}

export default function Home( { allKitties } ) {
  const getKittiesSorted = ( orderby = 'id', order='desc' ) => {
    let sortedData;

    if ( orderby === 'forsale' ) {
      sortedData = orderBy( allKitties, item => {
        let a = parseInt( item.forsale );
        if ( a === 0 ) {
          a = order === 'desc' ? -1 : Number.MAX_SAFE_INTEGER;
        }
        return a;
      }, order )
    } else {
      sortedData = orderBy( allKitties, item => item[ orderby ], [ order ]);
    }

    return sortedData;
  }

  let shownKittes = getKittiesSorted( 'forsale', 'desc' );

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
        <KittyGrid allKitties={ shownKittes } />
      </main>
    </div>
  )
}
