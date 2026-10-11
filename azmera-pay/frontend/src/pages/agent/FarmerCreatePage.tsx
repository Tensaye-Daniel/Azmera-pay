import { useNavigate } from 'react-router-dom'
import FarmerRegistrationWizard from '../../components/features/agent/FarmerRegistrationWizard'

export default function FarmerCreatePage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-forest-deeper">
          Register a farmer
        </h1>
        <p className="mt-1 text-sm text-stone">
          Complete the four steps to submit the farmer for verification. The
          farmer gets an Azmera account number to order inputs over USSD.
        </p>
      </div>

      <FarmerRegistrationWizard
        onSuccess={(farmer) =>
          navigate(`/agent/farmers/${farmer.id}`, { replace: true })
        }
      />
    </div>
  )
}