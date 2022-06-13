Kitty Part 1

You are reading part 2/3 on how to create a nifty front-end for your favorite NFT collection on singular.app using the latest web frameworks with advanced caching mechanisms.

[Part 1](https://app.subsocial.network/6904/coding-a-rmrk-nft-explorer-with-nextjs-part-1-33590) covered the project setup and an introduction to the UI and the UX. The data the app used was provided from a static json file in the repository, that was manually saved.

# In part 2 you will learn

- How to query an API to retrieve updated data regularly
- More about RMRK2.0 standard
- To filter and sort the list efficiently

# Prerequisites + Setting Up

```
git pull
# or git clone git@github.com:niklasp/kitty-explorer.git
git checkout part2-start 
# git checkout part2-complete -- if you do not want to write code
```

# Getting dynamic data from an API

For serverless applications in next.js we usually will not have a database backend. We could have it but it an extra step of coding not needed for this part of the tutorial.

> In part 3 we will eventuall make use of a database though to store data and especially to react to new blocks and changes to the NFTs we want to monitor

That said, one great data source modern frontend apps rely on are APIs. And luckily there is a [community-created open source API by Matthew Darnell](https://github.com/MatthewDarnell/rmrk2-template-boilerplate) that offers all we need at the moment:

- query RMRK collections
- query single RMRK NFTs

You can investigate the API endpoints here

```
http://138.68.123.124/api
```

We will use `/get_nfts_by_collection/:collection` where `:collection` is the collection id we can e.g. find on the singular marketplace in the browser adress bar:

[image]

So the final endpoint we want to query is

Currently the data source logic is in `lib/kitties.js`, where currently the dumped json file is read. Go ahead and add the following directly under the `getKitties` function definition:

```js
  const response = await fetch("http://138.68.123.124/get_nfts_by_collection/800f8a914281765a7d-KITTY" );
  const jsonData = await response.json();
```
Also make sure to remove the `import jsonData from './kitties.json';` at the beginning of the file.

We are waiting for the response of the asynchronous [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) and then the `json`-Method on the result.

> The Response object, in turn, does not directly contain the actual JSON response body but is instead a representation of the entire HTTP response. So, to extract the JSON body content from the Response object, we use the json() method, which returns a second promise that resolves with the result of parsing the response body text as JSON.

> *https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch*

Go ahead and test your frontend with `npm run dev` and watch the results.


```js
  let allKitties = [];
  let forSaleCount = 0;
  let floorKitties = {
    kitties:[],
    price: Number.MAX_SAFE_INTEGER,
  };
```



## Some words on API usage

The provided API is self hosted and there is a query limit of 20 queries per minute. That is very well understandable as the hosting and providing of the service costs money. There are usually free plans on heroku or other hosting services but if requests scale, so will the costs.

For NFTs, blockchain indexing will also require fetching lots of data from IPFS services. While a very trimmed down version of the nft metadata is stored onchain, many metadata is hidden behind another ipfs query for the full nft metadata (e.g.full history: sales, listings) as json.

Please keep that in mind when writing your applications and do not query too often, we will show below how we only query the API every 4 hours with next build in SSG revalidation.

Everyone is able to host the docker container themselves or create other work ontop of the repo.

Singular is also working on a API and eventually RMRK pallets will most probably make it obsolete because - as far as I understood - the polkadot API can then directly be queried very conveniently

[image api]


# Getting the data

The process of getting RMRK NFT data from Kusama consists of the following steps

```
1. Query some blockchain rpc endpoint for Remarks (RMRK Extrinsic) ->
2. Consolidate those Remarks to get contained JSON Data
3. Filter that JSON data for the collection you want
4. (listen to new blocks and start with 1.)
```

Luckily we do not have to do all of this (right now - will do in part 3), but there is up to date downloads downloads available for step 1 and step 2, and a handy unofficial API for step3. We will now use that API to get JSON data from the collection we want to query.

```
http://138.68.123.124/get_nfts_by_collection/800f8a914281765a7d-KITTY
```

In the repo you can already find an (outdated) dump of the collection in `lib/kitties.json`. Either work with that or download a new dump by overriding that file with the one from the API.

[ IMAGE from the json dump ]

|| Note for later that the metadata we get is a string, so we will have to parse it to json to work with it later.

If you want more information and try out consolidating your own blockchain dumps, read on here.

Now that you have the data in your app, let's go and display it

# Writing the controller

We start by writing a controller that will provide the application with the data we want (later we can reuse the code for blockchain queries). Open the file `lib/kitties.js`.

```js
import { orderBy } from "lodash";
import jsonData from './kitties.json';

export async function getKitties() {

  // transform the data we get from the json to a format we want
  const realKittyData = jsonData.map( ( kitObj ) => {
    // ...
  });

  // sort the data by id desc
  const sortedData = orderBy( realKittyData, item => item[ 'id' ], [ 'desc' ]);

  return {
    kitties: sortedData,
  };
}

```
First, we need to transform the data, that is a step of great importance, not only in this app but usually you would want to reformat the data by either renaming, aggregating or laying out the received data differently unless the API is really perfect :)

We are adding a simple `id` field e.g. as you maybe saw from the json dump the fields we get for each NFT are soething like
```json
...
id: "12125948-800f8a914281765a7d-KITTY-KITTY_PARADISE_40-00000040",
symbol: "KITTY_PARADISE_40",
...
```
While for the frontend we would just rather need the id `40` in this case. Still we are keeping the id in a new `uuid` field, as we will need that for the URI of the NFT on singular.app.

Finally the data is sorted descending by `id` using lodash's [orderby function](https://lodash.com/docs/4.17.15#orderBy) (also see [iteratee doc](https://lodash.com/docs/4.17.15#iteratee)) - no need to reinvent the wheel here, just make use of all those handy npm packages around. In Part 2 you will see different orders implemented (price e.g.).

# Leveraging Static Site Generation

We will use next.js `Static Site Generation` that will pregenerate sites generate a site on build-time of the app. That way the site loads lightning fast and the API is not queried on every page load but cached by nextjs.

> How does it work? Well, in Next.js, when you export a page component, you can also export an async function called `getStaticProps`. If you do this, then:
> - getStaticProps runs at build time in production, and…
>  - Inside the function, you can fetch external data and send it as props to the page.
> 
> ([https://nextjs.org/learn/basics/data-fetching/with-data](https://nextjs.org/learn/basics/data-fetching/with-data))

So on our `pages/index.js` page we want to define the `async` `getStaticProps` function that gets the controllers `kitties` data and provides it to the Static site generator.

```js
import { getKitties } from '../lib/kitties'

export async function getStaticProps() {
  const { kitties } = await getKitties();

  return {
    props: {
      allKitties: kitties,
    },
  }
}
```

By returning `allKitties` inside the props object in getStaticProps, the kitties from the jsonDump (later from the API) will be passed to the Home component as a prop. Now you can access the kitties on that page like so:

```
export default function Home( { allKitties } ) { ... }
```

# Writing the `KittyCard` and `KittyGrid` components

Now that we have the data on the page, we can write two [react components](https://reactjs.org/docs/components-and-props.html) to actually display them.
- `KittyCard` will display a single kitty image along with a name and a link to the singular NFT. It will also provide the DOM needed to render the popups that happen when the users click on the kitty.
- `KittyGrid` is basically a wrapper for all the kitties, providing css classes for styling and can later handle detail data fetching when single kitties are clicked. It will display a error message if no kitties are found / supplied from page props.

Let's start with `KittyGrid` in `components/kitty-grid.js`
```js
export default function KittyGrid( props ) {
  ...

  return (
    <div className={ classes }>
      { props.allKitties && props.allKitties.length ? props.allKitties.map( kit => {
        return <KittyCard
          mediaUri={ kit.metadata.mediaUri }
          id={ kit.id }
          key={ kit.uuid }
          uuid={ kit.uuid }
          forsale={ kit.forsale }
          description={ kit.metadata.description }
        />
      }) : <div>no kitties found</div> }
    </div>
  );

  ...
}
```
It checks if `allKitties` were provided in the component props and `maps` over them to display a single `<KittyCard>` component for each `kit`, passing down the needed props.

The `KittyCard` component will then render all the passed props to an nextjs `<Image>`.

```js
export default function KittyCard( props ) {
  const {
    id,
    uuid,
    mediaUri,
    forsale,
    description,
    handleClick,
  } = props;

  ...

  return (
    <div className={ classes }>
      <div className="kitty-name">
        { `Kitty Paradise #${ id }` }
      </div>
      { mediaUri ?
        <Image
          key={ uuid }
          src={ mediaUri }
          alt={ `Kitty Paradise #${ id }` }
          width={ 640 }
          height={ 640 }
          data-zoomable
          data-album="kitties-album"
          data-id={ uuid }
          data-forsale={ forsale }
          data-title={ `Kitty Paradise #${ id }` }
          data-description={ description }
          onError={ handleSrcError }
        /> :
        <div className="kitty-image-error">ipfs error - try later</div>
      }
      <div className="kitty-meta">
        { forsale !== '0' ?
          <a
            href={ `https://singular.app/collectibles/${ uuid }` }
            target='_blank'
          >
            Buy for 
            <span className="kitty-price">
              { forsale / 0.9 / 1000000000000 } KSM
            </span>
          </a>
        :
          <a
            href={ `https://singular.app/collectibles/${ uuid }` }
            target='_blank'
          >
            View on Singular
          </a>
        }
      </div>
    </div>
  )
}
```
It seems a lot of code, but it is basically the [next.js `<Image>`](https://nextjs.org/docs/basic-features/image-optimization#remote-images) component. It is an optimized `<img>` with lazy loading and other performance optimizations applied.

Also note the `data-` attributes. They are needed for the zoom-plugin you will learn about in the next chapter. The `kitty-name` and `kitty-meta` divs are hidden by default and only shown on hover. 

In `kitty-meta`, you see a condition that checks if `forsale !== '0'`. Remeber the data from the json dump? There is no boolean attribute we could use as a value but rather the `forsale` attribute has the value `0` when an NFT is not for sale. Second caveat, the `forsale` attribute does not store the price you can purchase the NFT for, but rather the price, the seller will get. The difference is the creator royalities, that means, if it is for sale, the price can be calculated with
```
price = forsale / ( 1 - royalities for the collection in % ) / 1000000000000
```
So, in both cases - for sale and not for sale - we add a link to singular. But in case it is for sale, also the price one has to pay is displayed.

## Adding Style


Now all we have to do is to add the required css. For simplicity all styles are globally added in `styles/app.scss` which is included into all pages via the [`pages/_app.js`](https://nextjs.org/learn/basics/assets-metadata-css/global-styles) file. We leave it as a challenge to the readers to use [`Layout Components`](https://nextjs.org/learn/basics/assets-metadata-css/layout-component) or any other style option available to react.

# The Zoom UX

For the website the idea is not only to see all the NFT artwork in overview but also to focus on one, and to zoom it in and see it larger.

There are many image zoom plugins or lightbox plugins around. Personally I tend to use [`medium-zoom`](https://github.com/francoischalifour/medium-zoom), but it has it's difficulties with absolute positioned elements the next.js `<Image>` component adds to the dom. So I found [`yet another medium zoom` (yamz)](https://github.com/birjj/yet-another-medium-zoom) which solves the task flawlessly and on top provides options for manipulating the zoomed DOM. That way we can also add some more details next to the zoomed kitty

The initialization logic of yamz is located in a `useEffect` hook that will fire when the component is rendered.

```js
  useEffect(() => {
    const $images = [...document.querySelectorAll('[data-zoomable]')];
    yamz.setOptions({
      duration: 150,
      lightboxGenerator: customLightboxGenerator,
    });
    yamz.bind($images);
  }, []);
```

Basically it is creating the zoom logic for all `$images` and adding the `customLightboxGenerator` which is imported from `lib/yamz.js`. The generator is basically the one from the [github example of yamz](https://github.com/birjj/yet-another-medium-zoom/blob/master/website/js/index.ts) with some adaptions and css styles added.

# Publishing the app

On [vercel](https://vercel.com/new), you can get most of the hosting features for your next.js app for free.

[image here]

Just hit "New Project", then connect your github account. And when you push any branch, vercel will automatically generate a build and host it on a specified domain you see in the UI.

# Final Thoughts

Thank you for reading this far. And looking forward to part 2 + 3 with more blockchain interaction.

Follow me on twitter for more #dotsama related things: [@niftesty](https://twitter.com/niftesty)

Or donate some SUB or KSM below this post. It will make me continue.

# Credits + Learning Resources

If you are new to nextjs, start at [learn nextjs](https://nextjs.org/learn/basics/create-nextjs-app).

[rmrk2 boilerplate by Mathew Darnell](https://github.com/MatthewDarnell/rmrk2-template-boilerplate) - it is open source, you can host your own API in a docker container

[Yet Another Medium Zoom](https://github.com/birjj/yet-another-medium-zoom)