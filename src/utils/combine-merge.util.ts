import merge from 'deepmerge';

export const combineMerge = (target: unknown[], source: unknown[], options: merge.ArrayMergeOptions) => {
  const destination = [...target]

  for (const [index, item] of source.entries()) {
    if (destination[index] === undefined) {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item as never, options)
    } else if (options.isMergeableObject(item as never)) {
      destination[index] = merge(target[index] as unknown[], item as unknown[], options)
    } else if (!target.includes(item)) {
      destination.push(item)
    }
  }

  return destination
}