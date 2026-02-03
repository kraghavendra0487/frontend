import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { TimeIcon } from '@chakra-ui/icons';
import AdminLayout from '../../components/AdminLayout';

const CronJobs = () => {
  return (
    <AdminLayout>
      <Container maxW="container.lg" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading size="lg" color="gray.800">
            Cron Jobs
          </Heading>
          <Card bg="white" borderRadius="lg" boxShadow="md">
            <CardBody>
              <VStack spacing={4} align="center" py={8}>
                <TimeIcon boxSize={12} color="gray.400" />
                <Heading size="md" color="gray.700">
                  Coming soon
                </Heading>
                <Text color="gray.600" textAlign="center" maxW="md">
                  Scheduled tasks and cron jobs will be managed here. You will be able to view,
                  create, and manage automated jobs (e.g. reminders, report generation, sync tasks)
                  in a future update.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </AdminLayout>
  );
};

export default CronJobs;
