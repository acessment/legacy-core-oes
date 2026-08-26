import React, { useState } from "react";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import {
    Container,
    Title,
    Card,
    Text,
    Stack,
    Group,
    Badge,
    Button,
    Divider,
    Alert,
    CopyButton,
    ActionIcon,
    Tooltip,
    SegmentedControl,
} from "@mantine/core";
import {
    IconCopy,
    IconCheck,
    IconQrcode,
    IconPhone,
    IconGift,
    IconCurrencyDollar,
    IconBrandWhatsapp,
} from "@tabler/icons-react";

export const Page = () => {
    const handlePaymeRedirect = () => {
        window.open("https://payme.hsbc/acessment", "_blank");
    };

    // determine if current account is trial
    const isTrial = useCheckTrial();
    const [selectedMonths, setSelectedMonths] = useState<number>(1);

    const baseMonthlyPrice = 150; // 原價每月
    const threeMonthMonthlyPrice = 99; // 三個月套票每月
    const monthlyPrice = selectedMonths === 3 ? threeMonthMonthlyPrice : baseMonthlyPrice;
    const subtotal = monthlyPrice * selectedMonths;
    const trialDiscount = isTrial ? 10 : 0; // 所有選項均有 $10 折扣（試用帳戶）
    const total = Math.max(0, subtotal - trialDiscount);

    const currency = (v: number) => new Intl.NumberFormat("zh-HK", { style: "currency", currency: "HKD" }).format(v);

    const handleCheckout = () => {
        // Scroll to payment methods section
        const el = document.getElementById("payment-methods");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <Container size="md" className="py-8">
            <Stack gap="xl">
                {/* Header */}
                <div className="text-center">
                    <Title order={1} className="text-ace-text-primary-gray">
                        付款資訊
                    </Title>

                    <Text size="lg" className="text-gray-600">
                        選擇你偏好的付款方式完成訂閱
                    </Text>
                </div>

                {/* Price Summary (only for trial accounts) */}

                <Card
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    className={selectedMonths === 3 ? "ring-2 ring-yellow-300 bg-yellow-50/40" : ""}
                >
                    <Stack gap="md">
                        <div className="flex items-center justify-between w-full">
                            <Title order={4}>選擇訂閱月份</Title>
                            <Badge
                                component="a"
                                href="https://api.whatsapp.com/send/?phone=85264647085&text=%E6%83%B3%E6%9F%A5%E8%A9%A2%E6%9C%89%E9%97%9C%E8%A8%82%E9%96%B1%E4%BA%8B%E5%AE%9C"
                                target="_blank"
                                rel="noreferrer"
                                variant="outline"
                                color="teal"
                                size="sm"
                                className="ml-2 cursor-pointer! hover:bg-green-100!"
                            >
                                需要協助？
                            </Badge>
                        </div>
                        <Text size="sm" color="dimmed">
                            請選擇你要一次支付的月份數{isTrial && <span>（試用帳戶享 $10 折扣）</span>}
                        </Text>

                        <SegmentedControl
                            value={String(selectedMonths)}
                            onChange={(val) => setSelectedMonths(parseInt(val, 10))}
                            data={[
                                { label: "1 個月", value: "1" },
                                { label: "2 個月", value: "2" },
                                {
                                    label: (
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="bg-gradient-to-r from-ace-blue to-pink-400 bg-clip-text text-transparent font-bold">
                                                3 個月
                                            </span>
                                        </div>
                                    ),
                                    value: "3",
                                },
                            ]}
                        />

                        <Divider />

                        <Group style={{ justifyContent: "space-between" }}>
                            <Text>每月價格</Text>
                            <Text>{currency(monthlyPrice)}/月</Text>
                        </Group>

                        <Group style={{ justifyContent: "space-between" }}>
                            <Text>數量</Text>
                            <Text>{selectedMonths} 個月</Text>
                        </Group>

                        <Group style={{ justifyContent: "space-between" }}>
                            <Text>小計</Text>
                            <Text>{currency(subtotal)}</Text>
                        </Group>

                        {isTrial && (
                            <Group style={{ justifyContent: "space-between" }}>
                                <Text>試用折扣</Text>
                                <Text className="text-green-600">- {currency(trialDiscount)}</Text>
                            </Group>
                        )}

                        <Divider />

                        <Group style={{ justifyContent: "space-between" }}>
                            <Text fw={700}>應付總額</Text>
                            <Text fw={700}>{currency(total)}</Text>
                        </Group>

                        <Button color="aceBlue" onClick={handleCheckout}>
                            結帳並前往付款方式
                        </Button>
                    </Stack>
                </Card>

                {/* Special Offer Alert */}
                <Alert
                    icon={<IconGift />}
                    title="🎁 限時優惠"
                    color="orange"
                    variant="light"
                    className="border-orange-200"
                >
                    <Stack gap="xs">
                        <Text size="sm">• 三個月套票每月 $99（原價 $150／月）</Text>
                    </Stack>
                </Alert>

                {/* Payment Methods */}
                <Stack gap="lg" id="payment-methods">
                    {/* Alipay */}
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Title order={3} className="flex items-center gap-2">
                                    <IconQrcode size={24} className="text-blue-600" />
                                    支付寶 Alipay
                                </Title>
                                <Badge color="blue" variant="light">
                                    Alipay
                                </Badge>
                            </Group>

                            <Text size="md" className="text-gray-700">
                                請掃描 QR Code 完成付款
                            </Text>

                            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                                <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200 overflow-hidden">
                                    <img
                                        src="/image/payment/Alipay_qr_code.jpg"
                                        alt="支付寶 QR Code"
                                        className="w-full h-full object-fill"
                                    />
                                </div>
                            </div>

                            <Text size="xs" className="text-gray-500 text-center">
                                使用支付寶 App 掃描上方 QR Code
                            </Text>
                        </Stack>
                    </Card>

                    {/* PayMe */}
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Title order={3} className="flex items-center gap-2">
                                    <IconCurrencyDollar size={24} className="text-green-600" />
                                    PayMe
                                </Title>
                                <Badge color="green" variant="light">
                                    PayMe
                                </Badge>
                            </Group>

                            <Text size="md" className="text-gray-700">
                                點擊下方按鈕前往 PayMe 付款
                            </Text>

                            <Group gap="xs" className="p-3 bg-gray-50 rounded-lg">
                                <Text size="sm" className="flex-1 font-mono">
                                    https://payme.hsbc/acessment
                                </Text>
                                <CopyButton value="https://payme.hsbc/acessment">
                                    {({ copied, copy }) => (
                                        <Tooltip label={copied ? "已複製!" : "複製連結"}>
                                            <ActionIcon
                                                color={copied ? "teal" : "gray"}
                                                variant="subtle"
                                                onClick={copy}
                                            >
                                                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </CopyButton>
                            </Group>

                            <Button color="green" size="md" onClick={handlePaymeRedirect} className="w-full">
                                前往 PayMe 付款
                            </Button>
                        </Stack>
                    </Card>

                    {/* FPS */}
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Title order={3} className="flex items-center gap-2">
                                    <IconPhone size={24} className="text-purple-600" />
                                    轉數快 FPS
                                </Title>
                                <Badge color="purple" variant="light">
                                    銀行轉賬
                                </Badge>
                            </Group>

                            <Text size="md" className="text-gray-700">
                                使用以下電話號碼進行轉數快付款
                            </Text>

                            <Group gap="xs" className="p-3 bg-gray-50 rounded-lg">
                                <Text size="lg" className="flex-1 font-mono font-bold">
                                    電話：53653761
                                </Text>
                                <CopyButton value="53653761">
                                    {({ copied, copy }) => (
                                        <Tooltip label={copied ? "已複製!" : "複製電話號碼"}>
                                            <ActionIcon
                                                color={copied ? "teal" : "gray"}
                                                variant="subtle"
                                                onClick={copy}
                                            >
                                                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </CopyButton>
                            </Group>

                            <Alert color="purple" variant="light" className="text-sm">
                                請在轉賬時加入你的用戶名稱或電話號碼作為備註
                            </Alert>
                        </Stack>
                    </Card>
                    <Card shadow="sm" padding="lg" radius="md" withBorder className="bg-blue-50">
                        <Stack gap="md">
                            <Title order={4} className="text-center text-blue-800">
                                付款後須知
                            </Title>
                            <Stack gap="xs">
                                <Text size="sm" className="text-blue-700">
                                    • 付款後請保留收據或截圖
                                </Text>
                                <Text size="sm" className="text-blue-700">
                                    • 我們會在 24 小時內確認你的付款
                                </Text>
                                <Text size="sm" className="text-blue-700">
                                    • 如有任何問題，請WhatsApp聯絡客戶服務團隊
                                </Text>
                            </Stack>
                        </Stack>
                    </Card>
                </Stack>

                <Divider my="xl" />

                {/* WhatsApp follow-up */}
                <Card shadow="sm" padding="lg" radius="md" withBorder className="bg-green-50">
                    <Stack gap="sm" align="center">
                        <Title order={5}>完成付款後</Title>
                        <Text size="sm" className="text-gray-700 text-center">
                            付款完成後請截圖並透過 WhatsApp 發送給我們，或如有任何疑問也可直接在 WhatsApp
                            詢問，我們會盡快回覆。
                        </Text>

                        <Group>
                            <Button
                                component="a"
                                href="https://api.whatsapp.com/send/?phone=85264647085&text=%E6%88%91%E6%83%B3%E5%8D%87%E7%B4%9A/%E6%9F%A5%E8%A9%A2%E4%B8%89%E5%90%88%E4%B8%80%E8%8B%B1%E8%AA%9E%E6%AF%8F%E6%97%A5%E4%B8%80%E7%AF%87%E8%A8%88%E5%8A%83"
                                target="_blank"
                                rel="noreferrer"
                                color="teal"
                                leftSection={<IconBrandWhatsapp />}
                            >
                                透過 WhatsApp 發送截圖 / 詢問
                            </Button>
                        </Group>

                        <Text size="xs" color="dimmed">
                            或致電/WhatsApp：+852 6464 7085
                        </Text>
                    </Stack>
                </Card>

                {/* Footer */}
            </Stack>
        </Container>
    );
};

export const PaymentInfoCorePage = () => {
    return <Page />;
};

export const PaymentInfoPage = () => {
    return <PaymentInfoCorePage />;
};
