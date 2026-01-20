"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAlert } from "@/context/AlertProvider";
import useAuthGuard from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { Card } from "@/components/ui/card";
import {
  getAllHackathonRequests,
  approveHackathonRequest,
  rejectHackathonRequest,
  HackathonRequest,
} from "@/services/hackathon-requests";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function HackathonRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  
  const { showAlert } = useAlert();
  const { isLoading: authLoading } = useAuthGuard();
  const approveModal = useModal();
  const rejectModal = useModal();

  const [request, setRequest] = useState<HackathonRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");

  useEffect(() => {
    loadRequestDetail();
  }, [requestId]);

  /**
   * Charge les détails d'une demande spécifique
   * Filtre depuis la liste complète pour éviter un nouvel endpoint
   */
  async function loadRequestDetail() {
    try {
      setLoading(true);
      const allRequests = await getAllHackathonRequests();
      const foundRequest = allRequests.find(r => r.id === requestId);
      
      if (!foundRequest) {
        showAlert(
          "error",
          "Not Found",
          "Hackathon request not found"
        );
        router.push("/hackathon-requests");
        return;
      }

      setRequest(foundRequest);
    } catch (error: any) {
      showAlert(
        "error",
        "Error",
        error.message || "Failed to load request details"
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Approuve la demande
   * Appel API: PATCH /admin/hackathon-requests/{id}/approve
   */
  async function handleApprove() {
    if (!request) return;

    try {
      setActionLoading(true);
      await approveHackathonRequest(request.id);
      
      showAlert(
        "success",
        "Success",
        "Hackathon request approved successfully"
      );

      approveModal.closeModal();
      await loadRequestDetail();
    } catch (error: any) {
      showAlert(
        "error",
        "Error",
        error.message || "Failed to approve request"
      );
    } finally {
      setActionLoading(false);
    }
  }

  /**
   * Rejette la demande
   * Appel API: PATCH /admin/hackathon-requests/{id}/reject
   */
  async function handleReject() {
    if (!request) return;

    // Validation: minimum 10 caractères
    if (rejectReason.trim().length < 10) {
      setRejectReasonError("Reason must be at least 10 characters");
      return;
    }

    try {
      setActionLoading(true);
      setRejectReasonError("");
      await rejectHackathonRequest(request.id, rejectReason.trim());
      
      showAlert(
        "success",
        "Success",
        "Hackathon request rejected"
      );

      rejectModal.closeModal();
      setRejectReason("");
      await loadRequestDetail();
    } catch (error: any) {
      showAlert(
        "error",
        "Error",
        error.message || "Failed to reject request"
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (authLoading || loading) {
    return <LoadingSpinner text="Loading request details..." />;
  }

  if (!request) {
    return null;
  }

  const isPending = request.status === "PENDING";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        href="/hackathon-requests"
        className="neo-btn mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Requests</span>
      </Link>

      {/* Header with Status */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#18191F] dark:text-white mb-2">
              {request.hackTitle}
            </h1>
            {request.hackCategory && (
              <p className="text-gray-500 dark:text-gray-400">
                Category: {request.hackCategory.name}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#18191F] font-bold ${
            request.status === "PENDING" ? "bg-[#FFFBEA] text-[#FFBD12]" :
            request.status === "APPROVED" ? "bg-[#E8F8F3] text-[#56CCA9]" :
            "bg-[#FFE8E8] text-[#FF4B1E]"
          }`}>
            {request.status === "PENDING" && <Clock className="h-5 w-5" />}
            {request.status === "APPROVED" && <CheckCircle2 className="h-5 w-5" />}
            {request.status === "REJECTED" && <XCircle className="h-5 w-5" />}
            {request.status}
          </div>
        </div>

        {/* Action Buttons - Only for Pending Requests */}
        {isPending && (
          <div className="flex gap-3">
            <Button
              onClick={approveModal.openModal}
              variant="success"
              size="md"
              className="bg-[#56CCA9] hover:bg-[#45B894]"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Approve Request
            </Button>
            <Button
              onClick={rejectModal.openModal}
             variant="primary"
              size="md"
              className="bg-[#FF4B1E] text-white border-[#18191F] hover:bg-[#e5431b]"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Reject Request
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Organization Info */}
        {request.organization && (
          <Card
            variant="detail"
            status={request.status}
            title="Organization"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-lg font-medium text-[#18191F] dark:text-white">
                  {request.organization.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Slug</p>
                <p className="text-lg font-medium text-[#18191F] dark:text-white">
                  {request.organization.slug}
                </p>
              </div>
              {request.organization.owner && (
                <>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Owner</p>
                    <p className="font-medium text-[#18191F] dark:text-white">{request.organization.owner.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{request.organization.owner.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                    <p className="font-medium text-[#18191F] dark:text-white">{request.organization.owner.username}</p>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}

        {/* Basic Hackathon Info */}
        <Card
          variant="detail"
          type="info"
          title="Basic Information"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Slug</p>
              <p className="font-medium text-[#18191F] dark:text-white">{request.hackSlug}</p>
            </div>

            {request.hackType && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                <p className="font-medium text-[#18191F] dark:text-white">{request.hackType}</p>
              </div>
            )}

            {request.hackCategory && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                <p className="font-medium text-[#18191F] dark:text-white">{request.hackCategory.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{request.hackCategory.description}</p>
              </div>
            )}

            {request.audience && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Target Audience</p>
                <p className="font-medium text-[#18191F] dark:text-white">{request.audience}</p>
              </div>
            )}

            {request.geographicScope && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Geographic Scope</p>
                <p className="font-medium text-[#18191F] dark:text-white">{request.geographicScope}</p>
              </div>
            )}

            {request.expectedAttendees !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Expected Attendees</p>
                <p className="font-medium text-[#18191F] dark:text-white">{request.expectedAttendees}</p>
              </div>
            )}

            {request.targetRegistrationGoal && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Target Registration Goal</p>
                <p className="font-medium text-[#18191F] dark:text-white">{request.targetRegistrationGoal.toLocaleString()}</p>
              </div>
            )}

            {request.estimatedReach && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Reach</p>
                <p className="font-medium text-[#18191F] dark:text-white">{request.estimatedReach.replace(/_/g, ' ')}</p>
              </div>
            )}
          </div>

          {request.focus && (
            <div className="mt-6 pt-6 border-t-2 border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Focus</p>
              <p className="text-[#18191F] dark:text-white whitespace-pre-wrap">{request.focus}</p>
            </div>
          )}
        </Card>

        {/* Dates & Timeline */}
        <Card
          variant="detail"
          type="warning"
          title="Dates & Timeline"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {request.registrationStart && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Registration Start</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {new Date(request.registrationStart).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {request.registrationEnd && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Registration End</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {new Date(request.registrationEnd).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {request.startDate && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hackathon Start</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {new Date(request.startDate).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {request.endDate && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hackathon End</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {new Date(request.endDate).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {request.judgingStart && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Judging Start</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {new Date(request.judgingStart).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {request.judgingEnd && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Judging End</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {new Date(request.judgingEnd).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Location Details */}
        {(request.hackCountry || request.hackCity || request.hackAddress) && (
          <Card
            variant="detail"
            type="info"
            title="Location"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {request.hackAddress && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  <p className="font-medium text-[#18191F] dark:text-white">{request.hackAddress}</p>
                </div>
              )}

              {request.hackCity && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
                  <p className="font-medium text-[#18191F] dark:text-white">{request.hackCity}</p>
                </div>
              )}

              {request.hackState && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">State</p>
                  <p className="font-medium text-[#18191F] dark:text-white">{request.hackState}</p>
                </div>
              )}

              {request.hackCountry && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                  <p className="font-medium text-[#18191F] dark:text-white">{request.hackCountry}</p>
                </div>
              )}

              {request.hackZipCode && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Zip Code</p>
                  <p className="font-medium text-[#18191F] dark:text-white">{request.hackZipCode}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Prize & Distribution */}
        <Card
          variant="detail"
          status={request.status}
          title="Prize & Distribution"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {request.prizePool && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Prize Pool</p>
                <p className="text-2xl font-bold text-[#18191F] dark:text-white">
                  ${request.prizePool.toLocaleString()}
                </p>
              </div>
            )}

            {request.prizeToken && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Prize Token</p>
                <p className="font-medium text-[#18191F] dark:text-white">{request.prizeToken}</p>
              </div>
            )}

            {request.expectedTotalWinners !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Expected Total Winners</p>
                <p className="font-medium text-[#18191F] dark:text-white">{request.expectedTotalWinners}</p>
              </div>
            )}
          </div>

          {request.distributionPlan && (
            <div className="mt-6 pt-6 border-t-2 border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Distribution Plan</p>
              <p className="text-[#18191F] dark:text-white whitespace-pre-wrap">{request.distributionPlan}</p>
            </div>
          )}
        </Card>

        {/* Funding & Sponsors */}
        <Card
          variant="detail"
          type="success"
          title="Funding & Sponsors"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {request.fundingSources && request.fundingSources.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Funding Sources</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {request.fundingSources.map((source, idx) => (
                    <span key={idx} className="px-3 py-1 bg-[#FFFBEA] dark:bg-brand-700/20 border border-[#FFBD12] dark:border-brand-700 rounded-lg text-sm font-medium text-[#18191F] dark:text-white">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {request.confirmedSponsors && request.confirmedSponsors.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Confirmed Sponsors</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {request.confirmedSponsors.map((sponsor, idx) => (
                    <span key={idx} className="px-3 py-1 bg-[#E8F8F3] dark:bg-success-900/20 border border-[#56CCA9] dark:border-success-700 rounded-lg text-sm font-medium text-[#18191F] dark:text-white">
                      {sponsor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {request.needSponsorsHelp !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Need Sponsors Help</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {request.needSponsorsHelp ? "Yes" : "No"}
                </p>
              </div>
            )}

            {request.sponsorLevel && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sponsor Level</p>
                <p className="font-medium text-[#18191F] dark:text-white">{request.sponsorLevel}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Venue & Technical Support */}
        <Card
          variant="detail"
          type="default"
          title="Venue & Technical Support"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {request.venueSecured && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Venue Secured</p>
                <p className="font-medium text-[#18191F] dark:text-white">{request.venueSecured}</p>
              </div>
            )}

            {request.needVenueHelp && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Need Venue Help</p>
                <p className="font-medium text-[#18191F] dark:text-white">{request.needVenueHelp}</p>
              </div>
            )}

            {request.technicalSupport !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Technical Support</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {request.technicalSupport ? "Yes" : "No"}
                </p>
              </div>
            )}

            {request.liveStreaming && (
              <div>
                <p className="text-sm text-gray-400 dark:text-gray-400">Live Streaming</p>
                <p className="font-medium text-[#18191F] dark:text-white">{request.liveStreaming.replace(/_/g, ' ')}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Marketing & Community */}
        <Card
          variant="detail"
          type="info"
          title="Marketing & Community"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {request.marketingHelp !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Marketing Help</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {request.marketingHelp ? "Yes" : "No"}
                </p>
              </div>
            )}

            {request.existingCommunity !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Existing Community</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {request.existingCommunity ? "Yes" : "No"}
                </p>
              </div>
            )}

            {request.marketingHelpDetails && request.marketingHelpDetails.length > 0 && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Marketing Help Details</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {request.marketingHelpDetails.map((detail, idx) => (
                    <span key={idx} className="px-3 py-1 bg-[#FFE8E8] dark:bg-error-900/20 border border-[#FF4B1E] dark:border-error-700 rounded-lg text-sm font-medium text-[#18191F] dark:text-white">
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Support Needs */}
        <Card
          variant="detail"
          type="warning"
          title="Support Needs"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {request.needWorkshopsHelp !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Need Workshops Help</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {request.needWorkshopsHelp ? "Yes" : "No"}
                </p>
              </div>
            )}

            {request.needTechnicalMentors !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Need Technical Mentors</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {request.needTechnicalMentors ? `Yes (${request.technicalMentorCount || 0})` : "No"}
                </p>
              </div>
            )}

            {request.needEducationalContent !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Need Educational Content</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {request.needEducationalContent ? "Yes" : "No"}
                </p>
              </div>
            )}

            {request.needSpeakers !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Need Speakers</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {request.needSpeakers ? "Yes" : "No"}
                </p>
              </div>
            )}

            {request.needJudges !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Need Judges</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {request.needJudges ? `Yes (${request.judgesCount || 0})` : "No"}
                </p>
              </div>
            )}

            {request.needJudgingCriteria !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Need Judging Criteria</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {request.needJudgingCriteria ? "Yes" : "No"}
                </p>
              </div>
            )}

            {request.needEvaluationSystem !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Need Evaluation System</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {request.needEvaluationSystem ? "Yes" : "No"}
                </p>
              </div>
            )}

            {request.needEventLogistics !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Need Event Logistics</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {request.needEventLogistics ? "Yes" : "No"}
                </p>
              </div>
            )}

            {request.needVolunteerCoordinators !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Need Volunteer Coordinators</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {request.needVolunteerCoordinators ? "Yes" : "No"}
                </p>
              </div>
            )}

            {request.needCommunitySetup !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Need Community Setup</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {request.needCommunitySetup ? "Yes" : "No"}
                </p>
              </div>
            )}

            {request.needOnCallSupport !== undefined && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Need On-Call Support</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {request.needOnCallSupport ? "Yes" : "No"}
                </p>
              </div>
            )}

            {request.workshopsHelpDetails && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Workshops Help Details</p>
                <p className="font-medium text-[#18191F] dark:text-white mt-1">{request.workshopsHelpDetails}</p>
              </div>
            )}

            {request.eventLogisticsDetails && request.eventLogisticsDetails.length > 0 && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Event Logistics Details</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {request.eventLogisticsDetails.map((detail, idx) => (
                    <span key={idx} className="px-3 py-1 bg-[#FFFBEA] dark:bg-brand-700/20 border border-[#FFBD12] dark:border-brand-700 rounded-lg text-sm font-medium text-[#18191F] dark:text-white">
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {request.judgesProfiles && request.judgesProfiles.length > 0 && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Judges Profiles</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {request.judgesProfiles.map((profile, idx) => (
                    <span key={idx} className="px-3 py-1 bg-[#E8F8F3] dark:bg-success-900/20 border border-[#56CCA9] dark:border-success-700 rounded-lg text-sm font-medium text-[#18191F] dark:text-white">
                      {profile}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Approval/Rejection Info */}
        {(request.approvedAt || request.rejectedAt) && (
          <Card
            variant="detail"
            status={request.status}
            title="Review History"
          >
            <div className="space-y-4">
              {request.approvedAt && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Approved At</p>
                  <p className="font-medium text-[#18191F] dark:text-white mb-1">
                    {new Date(request.approvedAt).toLocaleString()}
                  </p>
                  {request.approvedBy && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <p>Approved by: <span className="font-medium">{request.approvedBy.name}</span></p>
                      <p>Email: {request.approvedBy.email}</p>
                      <p>Role: {request.approvedBy.role}</p>
                    </div>
                  )}
                </div>
              )}

              {request.rejectedAt && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rejected At</p>
                  <p className="font-medium text-[#18191F] dark:text-white mb-1">
                    {new Date(request.rejectedAt).toLocaleString()}
                  </p>
                  {request.rejectedBy && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <p>Rejected by: <span className="font-medium">{request.rejectedBy.name}</span></p>
                      <p>Email: {request.rejectedBy.email}</p>
                      <p>Role: {request.rejectedBy.role}</p>
                    </div>
                  )}
                  {request.rejectedReason && (
                    <div className="mt-3 p-3 bg-[#FFE8E8] dark:bg-error-900/20 border dark:border-error-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reason</p>
                      <p className="text-[#18191F] dark:text-white">{request.rejectedReason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Timestamps */}
        <Card
          variant="detail"
          type="default"
          title="Timeline"
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
              <p className="font-medium text-[#18191F] dark:text-white">
                {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
              <p className="font-medium text-[#18191F] dark:text-white">
                {new Date(request.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={approveModal.isOpen}
        onClose={approveModal.closeModal}
      >
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-[#18191F]">Approve Hackathon Request</h2>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[#E8F8F3] border-2 border-[#56CCA9]">
            <AlertCircle className="h-5 w-5 text-[#56CCA9] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#18191F] mb-1">
                Are you sure you want to approve this request?
              </p>
              <p className="text-sm text-gray-600">
                This will change the status to APPROVED and allow the organization to proceed with this hackathon.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              onClick={approveModal.closeModal}
              variant="outline"
              size="md"
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              variant="primary"
              size="md"
              disabled={actionLoading}
              className="bg-[#56CCA9] hover:bg-[#45B894]"
            >
              {actionLoading ? "Approving..." : "Approve Request"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.isOpen}
        onClose={rejectModal.closeModal}
        className="w-1/2"
      >
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-[#18191F]">Reject Hackathon Request</h2>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[#FFE8E8] border-2 border-[#FF4B1E]">
            <AlertCircle className="h-5 w-5 text-[#FF4B1E] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#18191F] mb-1">
                Are you sure you want to reject this request?
              </p>
              <p className="text-sm text-gray-600">
                This will change the status to REJECTED. The organization will need to submit a new request if they want to try again.
              </p>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-[#18191F] mb-2">
              Reason for rejection <span className="text-[#FF4B1E]">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                if (rejectReasonError) setRejectReasonError("");
              }}
              placeholder="Provide a detailed reason for rejecting this request (minimum 10 characters)..."
              className={`w-full min-h-[120px] px-4 py-3 rounded-xl border-2 ${
                rejectReasonError
                  ? "border-[#FF4B1E] focus:border-[#FF4B1E]"
                  : "border-[#18191F] focus:border-[#2B7FFF]"
              } outline-none resize-none transition-colors`}
              disabled={actionLoading}
            />
            {rejectReasonError && (
              <p className="text-[#FF4B1E] text-sm mt-2 font-medium">
                {rejectReasonError}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {rejectReason.length}/10 characters minimum
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              onClick={rejectModal.closeModal}
              variant="outline"
              size="md"
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              variant="primary"
              size="md"
              disabled={actionLoading}
              className="bg-[#FF4B1E] hover:bg-[#e5431b]"
            >
              {actionLoading ? "Rejecting..." : "Reject Request"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
