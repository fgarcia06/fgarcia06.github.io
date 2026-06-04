import type { ReactNode } from 'react'
import { Modal } from './Modal'

/**
 * Backwards-compatible thin wrapper over {@link Modal}. New code should use
 * Modal directly (it exposes size + aria labelling); this keeps older call
 * sites working with the same props.
 */
export function Popup({
  onClose,
  accent = '#9caa7b',
  children,
}: {
  onClose: () => void
  accent?: string
  children: ReactNode
}) {
  return (
    <Modal onClose={onClose} accent={accent} ariaLabel="Dialog" size="lg">
      <div className="p-6 sm:p-8">{children}</div>
    </Modal>
  )
}
