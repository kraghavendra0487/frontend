import "./ResumeProfile.css"
import { Box, Spinner, Center } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { StudentProfileService } from "../../../services/studentProfile.service"
import { useAuth } from "../../../context/AuthContext"
import { ResumeModule } from "../../../components/student/ResumeModule"

export const ResumeProfile = () => {
  const { user } = useAuth()
  const usn = user?.usn 
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (!usn) return

    const fetchData = async () => {
        setLoading(true)
        try {
            const fullProfile = await StudentProfileService.getFullProfile(usn)
            setData(fullProfile)
        } catch (error) {
            alert("Error loading data")
        } finally {
            setLoading(false)
        }
    }

    fetchData()
  }, [usn])

  if (loading || !data) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="#d4a960" />
      </Center>
    )
  }

  return (
    <Box maxW="5xl" mx="auto">
      <ResumeModule fullProfile={data} usn={usn} />
    </Box>
  )
}
