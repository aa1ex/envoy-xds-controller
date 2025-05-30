// @generated by protoc-gen-es v2.2.5 with parameter "target=ts"
// @generated from file util/v1/util.proto (package util.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc, serviceDesc } from "@bufbuild/protobuf/codegenv1";
import type { Timestamp } from "@bufbuild/protobuf/wkt";
import { file_google_protobuf_timestamp } from "@bufbuild/protobuf/wkt";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file util/v1/util.proto.
 */
export const file_util_v1_util: GenFile = /*@__PURE__*/
  fileDesc("ChJ1dGlsL3YxL3V0aWwucHJvdG8SB3V0aWwudjEiJwoUVmVyaWZ5RG9tYWluc1JlcXVlc3QSDwoHZG9tYWlucxgBIAMoCSKxAQoYRG9tYWluVmVyaWZpY2F0aW9uUmVzdWx0Eg4KBmRvbWFpbhgBIAEoCRIZChF2YWxpZF9jZXJ0aWZpY2F0ZRgCIAEoCBIOCgZpc3N1ZXIYAyABKAkSLgoKZXhwaXJlc19hdBgEIAEoCzIaLmdvb2dsZS5wcm90b2J1Zi5UaW1lc3RhbXASGwoTbWF0Y2hlZF9ieV93aWxkY2FyZBgFIAEoCBINCgVlcnJvchgGIAEoCSJLChVWZXJpZnlEb21haW5zUmVzcG9uc2USMgoHcmVzdWx0cxgBIAMoCzIhLnV0aWwudjEuRG9tYWluVmVyaWZpY2F0aW9uUmVzdWx0Ml4KDFV0aWxzU2VydmljZRJOCg1WZXJpZnlEb21haW5zEh0udXRpbC52MS5WZXJpZnlEb21haW5zUmVxdWVzdBoeLnV0aWwudjEuVmVyaWZ5RG9tYWluc1Jlc3BvbnNlQpoBCgtjb20udXRpbC52MUIJVXRpbFByb3RvUAFaQ2dpdGh1Yi5jb20va2Fhc29wcy9lbnZveS14ZHMtY29udHJvbGxlci9wa2cvYXBpL2dycGMvdXRpbC92MTt1dGlsdjGiAgNVWFiqAgdVdGlsLlYxygIHVXRpbFxWMeICE1V0aWxcVjFcR1BCTWV0YWRhdGHqAghVdGlsOjpWMWIGcHJvdG8z", [file_google_protobuf_timestamp]);

/**
 * @generated from message util.v1.VerifyDomainsRequest
 */
export type VerifyDomainsRequest = Message<"util.v1.VerifyDomainsRequest"> & {
  /**
   * A list of domains to verify SSL certificates for.
   *
   * @generated from field: repeated string domains = 1;
   */
  domains: string[];
};

/**
 * Describes the message util.v1.VerifyDomainsRequest.
 * Use `create(VerifyDomainsRequestSchema)` to create a new message.
 */
export const VerifyDomainsRequestSchema: GenMessage<VerifyDomainsRequest> = /*@__PURE__*/
  messageDesc(file_util_v1_util, 0);

/**
 * @generated from message util.v1.DomainVerificationResult
 */
export type DomainVerificationResult = Message<"util.v1.DomainVerificationResult"> & {
  /**
   * The domain being verified.
   *
   * @generated from field: string domain = 1;
   */
  domain: string;

  /**
   * Indicates if the domain has a valid SSL certificate.
   *
   * @generated from field: bool valid_certificate = 2;
   */
  validCertificate: boolean;

  /**
   * The issuer of the SSL certificate.
   *
   * @generated from field: string issuer = 3;
   */
  issuer: string;

  /**
   * The expiration timestamp of the SSL certificate.
   *
   * @generated from field: google.protobuf.Timestamp expires_at = 4;
   */
  expiresAt?: Timestamp;

  /**
   * Indicates if the domain was matched using a wildcard certificate.
   *
   * @generated from field: bool matched_by_wildcard = 5;
   */
  matchedByWildcard: boolean;

  /**
   * Any error messages related to the domain's verification.
   *
   * @generated from field: string error = 6;
   */
  error: string;
};

/**
 * Describes the message util.v1.DomainVerificationResult.
 * Use `create(DomainVerificationResultSchema)` to create a new message.
 */
export const DomainVerificationResultSchema: GenMessage<DomainVerificationResult> = /*@__PURE__*/
  messageDesc(file_util_v1_util, 1);

/**
 * @generated from message util.v1.VerifyDomainsResponse
 */
export type VerifyDomainsResponse = Message<"util.v1.VerifyDomainsResponse"> & {
  /**
   * A list of the results for each domain verification.
   *
   * @generated from field: repeated util.v1.DomainVerificationResult results = 1;
   */
  results: DomainVerificationResult[];
};

/**
 * Describes the message util.v1.VerifyDomainsResponse.
 * Use `create(VerifyDomainsResponseSchema)` to create a new message.
 */
export const VerifyDomainsResponseSchema: GenMessage<VerifyDomainsResponse> = /*@__PURE__*/
  messageDesc(file_util_v1_util, 2);

/**
 * @generated from service util.v1.UtilsService
 */
export const UtilsService: GenService<{
  /**
   * Verifies the SSL certificates of the provided domains.
   *
   * @generated from rpc util.v1.UtilsService.VerifyDomains
   */
  verifyDomains: {
    methodKind: "unary";
    input: typeof VerifyDomainsRequestSchema;
    output: typeof VerifyDomainsResponseSchema;
  },
}> = /*@__PURE__*/
  serviceDesc(file_util_v1_util, 0);

