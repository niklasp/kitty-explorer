import yamz from "yet-another-medium-zoom";

export function customLightboxGenerator(
  $img,
  opts,
  $original,
) {
  const $lightbox = yamz.defaultLightboxGenerator($img, opts, $original);

  $lightbox.classList.add("custom");

  // our custom layout has a left/right seperation; generate the two containers
  const $left = document.createElement("div");
  $left.classList.add("custom__left");
  // and move the displayed image into the left side
  $left.appendChild($lightbox.querySelector(".yamz__img-wrapper"));

  const $right = document.createElement("div");
  $right.classList.add("custom__right");
  // also insert a custom description into the lightbox
  const $description = document.createElement("div");
  $description.classList.add('kitty-desc');
  const $title = document.createElement("h2");
  $title.appendChild(document.createTextNode($original.dataset.title));
  $description.appendChild($title);
  // const htmlDesc = $original.dataset.description.replace( '\n', '<br>' );
  $description.appendChild(document.createTextNode($original.dataset.description));

  if ( $original.dataset.id && $original.dataset.id !== '' ) {
    const $singularButton = document.createElement('a');
    $singularButton.classList.add('kitty-button');
    $singularButton.target = '_blank';
    $singularButton.href= `https://singular.app/collectibles/${ $original.dataset.id }`
    if ( $original.dataset.forsale && $original.dataset.forsale !== '0' ) {
      $singularButton.appendChild(document.createTextNode(`Buy for ${ $original.dataset.forsale / 0.9 / 1000000000000 } KSM` ));
    } else {
      $singularButton.appendChild(document.createTextNode( `View on Singular` ));
    }
    $description.appendChild( $singularButton );
  }

  $right.appendChild($description);

  $lightbox.appendChild($left);
  $lightbox.appendChild($right);

  return $lightbox;
}