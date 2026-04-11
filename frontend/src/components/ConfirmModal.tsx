interface ConfirmModalProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmModal({ message, onConfirm, onCancel, loading }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-navy/40" onClick={onCancel} />
      <div className="relative bg-white rounded-md border border-border shadow-lg p-6 w-full max-w-sm mx-4">
        <p className="text-navy text-sm mb-5">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm text-mid hover:text-navy transition-colors cursor-pointer disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-danger hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded cursor-pointer transition-colors"
          >
            {loading ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  )
}
