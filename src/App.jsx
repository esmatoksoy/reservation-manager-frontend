import { useEffect, useState } from 'react'
import { useSearchParams, useParams, useLocation } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { GuestForm } from './components/GuestForm'
import ErrorBoundary from './ErrorBoundary'

function App() {
  const [searchParams] = useSearchParams()
  const { requestId: pathRequestId } = useParams()
  const location = useLocation()
  const [requestId, setRequestId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reservationData, setReservationData] = useState(null)

  useEffect(() => {
    const fetchReservationData = async () => {
      const isCreateMode = location.pathname === '/reservations/create'

      if (isCreateMode) {
        setRequestId('')
        setReservationData(null)
        setError(null)
        setLoading(false)
        return
      }

      // Check both query param and path param
      const id = searchParams.get('requestId') || pathRequestId
      
      console.log('App.jsx - Current URL:', window.location.href)
      console.log('App.jsx - requestId from URL:', id)

      if (!id) {
        // No request ID provided
        setError('No reservation ID provided')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`http://localhost:8080/guest-detail/${id}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Reservation not found')
          } else {
            setError('Failed to load reservation')
          }
          setLoading(false)
          return
        }

        const data = await response.json()
        setReservationData(data)
        setRequestId(id)
        setLoading(false)
      } catch (err) {
        console.error('Error loading reservation:', err)
        setError('Error connecting to server')
        setLoading(false)
      }
    }

    fetchReservationData()
  }, [searchParams, pathRequestId, location.pathname])

  return (
    <ErrorBoundary>
      <ConfigProvider>
        <div>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h2>Loading...</h2>
            </div>
          ) : error ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h2>Error</h2>
              <p>{error}</p>
            </div>
          ) : (
            <GuestForm requestId={requestId} reservationData={reservationData} />
          )}
        </div>
      </ConfigProvider>
    </ErrorBoundary>
  )
}

export default App