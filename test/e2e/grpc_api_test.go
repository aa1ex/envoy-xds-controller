package e2e

import (
	"github.com/kaasops/envoy-xds-controller/test/utils"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"os/exec"
	"strings"
	"time"
)

func grpcAPIContext() {
	It("should ensure the grpc api available", func() {
		response := fetchDataViaGRPC("{}", "virtual_service.v1.VirtualServiceStoreService.ListVirtualService")
		Expect(strings.TrimSpace(response)).To(Equal("{}"))
	})
}

func fetchDataViaGRPC(params string, endpoint string) string {
	podName := "grpcurl"

	By("creating the grpcurl pod to fetch data")
	cmd := exec.Command("kubectl", "run", podName, "-n", namespace, "--restart=Never",
		"--image=fullstorydev/grpcurl:v1.9.3-alpine",
		"--", "-plaintext", "-d", params,
		"exc-e2e-envoy-xds-controller-grpc-api:10000",
		endpoint)
	_, err := utils.Run(cmd)
	Expect(err).NotTo(HaveOccurred(), "Failed to create grpcurl pod")

	checkReady := func(g Gomega) {
		cmd := exec.Command("kubectl", "-n", namespace, "get", "pods", podName, "-o", "jsonpath={.status.phase}")
		out, err := utils.Run(cmd)
		g.Expect(err).NotTo(HaveOccurred())
		g.Expect(out).To(Equal("Succeeded"))
	}
	Eventually(checkReady, time.Minute).Should(Succeed())

	By("reading response")
	cmd = exec.Command("kubectl", "logs", podName, "-n", namespace)
	response, err := utils.Run(cmd)
	Expect(err).NotTo(HaveOccurred(), "Failed to retrieve output from grpcurl pod")

	By("removing the grpcurl pod")
	cmd = exec.Command("kubectl", "-n", namespace, "delete", "pod", podName)
	_, err = utils.Run(cmd)
	Expect(err).NotTo(HaveOccurred(), "Failed to delete grpcurl pod")

	return response
}
