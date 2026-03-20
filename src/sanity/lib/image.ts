import createImageUrlBuilder from '@sanity/image-url'
import { dataset, projectId } from '../env'
import type { Image } from 'sanity'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlForImage = (source: Image) => {
  return imageBuilder?.image(source).auto('format').fit('max').width(1920)
}

export const urlForOgImage = (source: Image) => {
  return imageBuilder?.image(source).auto('format').fit('crop').width(1200).height(630)
}
