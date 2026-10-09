
import { useState, type FormEvent } from 'react'

// Data collected from the form
export type StockListingFormData = {
  productName: string
  unit: string
  quantity: number
  unitPrice: number
  validFrom: string
  validTo: string
}

// Functions provided by the parent component
type StockListingFormProps = {
  onSubmit: (data: StockListingFormData) => void
  onCancel: () => void
}

// Shared input styles
const inputClassName =
  'mt-1 w-full rounded-xl border border-forest/15 bg-white px-3 py-3 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/10'

const labelClassName = 'block text-sm font-medium text-forest-deeper'

export default function StockListingForm({
  onSubmit,
  onCancel,
}: StockListingFormProps) {
  // Form state
  const [productName, setProductName] = useState('')
  const [unit, setUnit] = useState('kg')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [validFrom, setValidFrom] = useState('')
  const [validTo, setValidTo] = useState('')
  const [error, setError] = useState('')

  // Validate and submit the form
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const parsedQuantity = Number(quantity)
    const parsedPrice = Number(unitPrice)

    if (!productName.trim()) {
      setError('Please enter a product name.')
      return
    }

    if (
      !Number.isFinite(parsedQuantity) ||
      !Number.isFinite(parsedPrice) ||
      parsedQuantity <= 0 ||
      parsedPrice <= 0
    ) {
      setError('Enter a valid quantity and price greater than zero.')
      return
    }

    if (!validFrom || !validTo || validTo < validFrom) {
      setError('Please enter valid availability dates.')
      return
    }

    // Send the validated data to the parent component
    onSubmit({
      productName: productName.trim(),
      unit,
      quantity: parsedQuantity,
      unitPrice: parsedPrice,
      validFrom,
      validTo,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-forest/10 bg-white p-5 sm:p-6"
    >
      {/* Form heading */}
      <div>
        <h2 className="font-serif text-xl font-semibold text-forest-deeper">
          Add a stock listing
        </h2>

        <p className="mt-1 text-sm leading-6 text-stone">
          Enter your product, available quantity, and price.
        </p>
      </div>

      {/* Product name */}
      <div>
        <label htmlFor="productName" className={labelClassName}>
          Product name
        </label>

        <input
          id="productName"
          type="text"
          value={productName}
          onChange={(event) => setProductName(event.target.value)}
          placeholder="e.g. Wheat seed"
          className={inputClassName}
          maxLength={100}
          required
        />
      </div>

      {/* Quantity and unit */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="quantity" className={labelClassName}>
            Available quantity
          </label>

          <input
            id="quantity"
            type="number"
            min="0.01"
            step="any"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="e.g. 100"
            className={inputClassName}
            required
          />
        </div>

        <div>
          <label htmlFor="unit" className={labelClassName}>
            Unit
          </label>

          <select
            id="unit"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            className={inputClassName}
          >
            <option value="kg">Kilogram (kg)</option>
            <option value="quintal">Quintal</option>
            <option value="ton">Ton</option>
            <option value="liter">Liter</option>
            <option value="piece">Piece</option>
            <option value="bag">Bag</option>
          </select>
        </div>
      </div>

      {/* Price */}
      <div>
        <label htmlFor="unitPrice" className={labelClassName}>
          Price per unit (ETB)
        </label>

        <input
          id="unitPrice"
          type="number"
          min="0.01"
          step="0.01"
          value={unitPrice}
          onChange={(event) => setUnitPrice(event.target.value)}
          placeholder="e.g. 85"
          className={inputClassName}
          required
        />
      </div>

      {/* Availability dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="validFrom" className={labelClassName}>
            Available from
          </label>

          <input
            id="validFrom"
            type="date"
            value={validFrom}
            onChange={(event) => setValidFrom(event.target.value)}
            className={inputClassName}
            required
          />
        </div>

        <div>
          <label htmlFor="validTo" className={labelClassName}>
            Available until
          </label>

          <input
            id="validTo"
            type="date"
            value={validTo}
            onChange={(event) => setValidTo(event.target.value)}
            min={validFrom || undefined}
            className={inputClassName}
            required
          />
        </div>
      </div>

      {/* Validation error */}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Form actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-forest/20 px-5 py-3 text-sm font-semibold text-forest hover:bg-forest/5"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-dark"
        >
          Add listing
        </button>
      </div>


    </form>
  )
}
