package e2e

import (
	"fmt"
	"github.com/kaasops/envoy-xds-controller/test/utils"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"os/exec"
	"time"
)

func grpcAPIContext() {
	It("should ensure the grpc api available", func() {

		podName := "grpcurl"

		By("creating the grpcurl pod to fetch data")
		cmd := exec.Command("kubectl", "run", podName, "-n", namespace, "--restart=Never",
			"--image=fullstorydev/grpcurl:v1.9.3-alpine",
			"--", "-plaintext", "-d", "{}",
			"exc-e2e-envoy-xds-controller-grpc-api:10000",
			"virtual_service.v1.VirtualServiceStoreService.ListVirtualService")
		_, err := utils.Run(cmd)
		Expect(err).NotTo(HaveOccurred(), "Failed to create grpcurl pod")

		checkReady := func(g Gomega) {
			cmd := exec.Command("kubectl", "-n", namespace, "get", "pods", podName, "-o", "jsonpath={.status.phase}")
			out, err := utils.Run(cmd)
			g.Expect(err).NotTo(HaveOccurred())
			g.Expect(out).To(Equal("Succeeded"))
		}
		Eventually(checkReady, time.Minute).Should(Succeed())

		By("get list of virtual services")
		cmd = exec.Command("kubectl", "logs", podName, "-n", namespace)
		response, err := utils.Run(cmd)
		Expect(err).NotTo(HaveOccurred(), "Failed to retrieve output from grpcurl pod")
		fmt.Println(response)
	})
}
