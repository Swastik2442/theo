type SelectionType = "album" | "image";

export const selectionTypeAttr = "data-selection-type";
export const selectionIdAttr = "data-selection-id";
export const selectedAttr = "data-selected";

/** Creates Attributes required for Selecting the Item */
export const createSelectionProps = (type: SelectionType, id: number, selected: boolean) => ({
  [selectionTypeAttr]: type,
  [selectionIdAttr]: id,
  [selectedAttr]: selected
});
/** Gets the ID of an element with Selection Attributes */
export const getElementId = (element: Element) => Number(element.getAttribute(selectionIdAttr)!);
/** Gets the Type of an element with Selection Attributes */
export const getElementType = (element: Element) => element.getAttribute(selectionTypeAttr) as SelectionType;
