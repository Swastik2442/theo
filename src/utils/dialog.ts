export function isAnyDialogOpen() {
  return (
    Array.from(document.querySelectorAll('dialog')).some(dlg => dlg.open) || // Normal Dialogs
    Array.from(document.querySelectorAll('div[role="dialog"]')).some(        // Radix Dialogs
      dlg => dlg.getAttribute('data-state') == 'open'
    )
  );
}
