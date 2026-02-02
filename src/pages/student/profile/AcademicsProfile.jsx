import { AcademicPerformanceForm } from "../../../components/student/forms/AcademicPerformanceForm"
import { GenericProfileSection } from "./GenericProfileSection"

export const AcademicsProfile = () => {
  return <GenericProfileSection sectionKey="academics" FormComponent={AcademicPerformanceForm} />
}
