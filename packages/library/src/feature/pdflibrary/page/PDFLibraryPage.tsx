import {
    Container,
    Grid,
    Pagination,
    Alert,
    Loader,
    Text,
    Stack,
    Center,
    Button,
    TextInput,
    Modal,
    Group,
    MultiSelect,
    Badge,
    Title,
} from "@mantine/core";
import { useLoaderData, useNavigate, useSearchParams } from "react-router";
import { IconSearch, IconFilter, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PDFCard } from "../component/PDFCard";
import type { PDFLibraryLoaderData } from "../loader/pdflibraryLoader.server";
import { useConfig } from "@/provider";

export default function PDFLibraryPage() {
    const appConfig = useConfig();
    const { t } = useTranslation();
    const { documents, total, page, totalPages, error } = useLoaderData() as PDFLibraryLoaderData;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Filter state
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        searchParams.get("categories")?.split(",").filter(Boolean) || []
    );
    const [selectedGrades, setSelectedGrades] = useState<string[]>(
        searchParams.get("grades")?.split(",").filter(Boolean) || []
    );

    // Filter options
    const categoryOptions = [
        { value: "grammar", label: "Grammar" },
        { value: "listening", label: "Listening" },
        { value: "reading", label: "Reading" },
    ];

    const gradeOptions = [
        { value: "P1", label: "P1" },
        { value: "P2", label: "P2" },
        { value: "P3", label: "P3" },
        { value: "P4", label: "P4" },
        { value: "P5", label: "P5" },
        { value: "P6", label: "P6" },
        { value: "S1", label: "S1" },
        { value: "S2", label: "S2" },
        { value: "S3", label: "S3" },
        { value: "S4", label: "S4" },
        { value: "S5", label: "S5" },
        { value: "S6", label: "S6" },
    ];

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", newPage.toString());
        navigate(`?${params.toString()}`);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(searchInput, selectedCategories, selectedGrades);
    };

    const applyFilters = (search: string, categories: string[], grades: string[]) => {
        const params = new URLSearchParams();
        params.set("page", "1"); // Reset to page 1 when filtering

        if (search.trim()) {
            params.set("search", search.trim());
        }
        if (categories.length > 0) {
            params.set("categories", categories.join(","));
        }
        if (grades.length > 0) {
            params.set("grades", grades.join(","));
        }

        navigate(`?${params.toString()}`);
        setFilterModalOpen(false);
    };

    const clearFilters = () => {
        setSearchInput("");
        setSelectedCategories([]);
        setSelectedGrades([]);
        navigate("?page=1");
        setFilterModalOpen(false);
    };

    const activeFilterCount =
        (selectedCategories.length > 0 ? 1 : 0) + (selectedGrades.length > 0 ? 1 : 0) + (searchInput.trim() ? 1 : 0);

    const handleCardClick = (cardClickUrl: string) => {
        navigate(`/pdflibrary/${cardClickUrl}`);
    };

    const generateThumbnailURL = (exerciseId: string): string => {

        console.log(`${appConfig.s3publicUrl}${exerciseId}.png`);
        return `${appConfig.s3publicUrl}${exerciseId}.png`;
    };

    // Error state
    if (error) {
        return (
            <Container size="xl" py="xl">
                <Alert color="red" title={t("Error loading PDF library")}>
                    {error}
                </Alert>
            </Container>
        );
    }

    // Empty state
    if (documents.length === 0) {
        return (
            <Container size="xl" py="xl">
                <Center style={{ minHeight: "50vh" }}>
                    <Stack align="center" gap="md">
                        <Text size="xl" fw={600} c="dimmed">
                            📭 {t("No PDFs found")}
                        </Text>
                        <Text c="dimmed">{t("The PDF library collection is empty.")}</Text>
                    </Stack>
                </Center>
            </Container>
        );
    }

    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                {/* Header */}
                <div>
                    <Title className="text-5xl" fw={700} mb="xs">
                        {t("PDF Library")}
                    </Title>
                    <Text c="dimmed">
                        {total} {total === 1 ? t("document") : t("documents")} {t("available")}
                    </Text>
                </div>

                {/* Search and Filter Bar */}
                <Group gap="md" align="flex-start">
                    <form onSubmit={handleSearchSubmit} style={{ flex: 1 }}>
                        <TextInput
                            placeholder={t("Search by title or description...")}
                            leftSection={<IconSearch size={16} />}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.currentTarget.value)}
                            rightSection={
                                searchInput && (
                                    <IconX
                                        size={16}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                            setSearchInput("");
                                            applyFilters("", selectedCategories, selectedGrades);
                                        }}
                                    />
                                )
                            }
                            styles={{ root: { flex: 1 } }}
                        />
                    </form>
                    <Button
                        leftSection={<IconFilter size={16} />}
                        onClick={() => setFilterModalOpen(true)}
                        variant={activeFilterCount > 0 ? "filled" : "default"}
                        rightSection={
                            activeFilterCount > 0 && (
                                <Badge size="xs" circle>
                                    {activeFilterCount}
                                </Badge>
                            )
                        }
                    >
                        {t("Filters")}
                    </Button>
                </Group>

                {/* Active Filters Display */}
                {activeFilterCount > 0 && (
                    <Group gap="xs">
                        <Text size="sm" c="dimmed">
                            {t("Active filters:")}
                        </Text>
                        {selectedCategories.map((cat) => (
                            <Badge
                                key={cat}
                                variant="light"
                                rightSection={
                                    <IconX
                                        size={12}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                            const newCategories = selectedCategories.filter((c) => c !== cat);
                                            setSelectedCategories(newCategories);
                                            applyFilters(searchInput, newCategories, selectedGrades);
                                        }}
                                    />
                                }
                            >
                                {cat}
                            </Badge>
                        ))}
                        {selectedGrades.map((grade) => (
                            <Badge
                                key={grade}
                                variant="light"
                                rightSection={
                                    <IconX
                                        size={12}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                            const newGrades = selectedGrades.filter((g) => g !== grade);
                                            setSelectedGrades(newGrades);
                                            applyFilters(searchInput, selectedCategories, newGrades);
                                        }}
                                    />
                                }
                            >
                                {grade}
                            </Badge>
                        ))}
                        <Button size="xs" variant="subtle" onClick={clearFilters}>
                            {t("Clear all")}
                        </Button>
                    </Group>
                )}

                {/* Filter Modal */}
                <Modal
                    opened={filterModalOpen}
                    onClose={() => setFilterModalOpen(false)}
                    title={t("Filter Documents")}
                    size="md"
                >
                    <Stack gap="lg">
                        <MultiSelect
                            label={t("Category")}
                            placeholder={t("Select categories")}
                            data={categoryOptions}
                            value={selectedCategories}
                            onChange={setSelectedCategories}
                            searchable
                            clearable
                        />

                        <MultiSelect
                            label={t("Grade")}
                            placeholder={t("Select grades")}
                            data={gradeOptions}
                            value={selectedGrades}
                            onChange={setSelectedGrades}
                            searchable
                            clearable
                        />

                        <Group justify="space-between" mt="xl">
                            <Button variant="subtle" onClick={clearFilters}>
                                {t("Clear All")}
                            </Button>
                            <Button onClick={() => applyFilters(searchInput, selectedCategories, selectedGrades)}>
                                {t("Apply Filters")}
                            </Button>
                        </Group>
                    </Stack>
                </Modal>

                {/* Grid of PDF Cards */}
                <Grid gutter="lg">
                    {documents.map((doc) => (
                        <Grid.Col key={doc._id} span={{ base: 12, xs: 6, sm: 6, md: 4, lg: 3 }}>
                            <PDFCard
                                title={doc.title}
                                thumbnailURL={generateThumbnailURL(String(doc._id))}
                                cardClickUrl={doc._id}
                                category={doc.category}
                                onCardClick={handleCardClick}
                            />
                        </Grid.Col>
                    ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Center mt="xl">
                        <Stack align="center" gap="sm">
                            <Text size="sm" c="dimmed">
                                {t("Page")} {page} {t("of")} {totalPages}
                            </Text>
                            <Pagination
                                total={totalPages}
                                value={page}
                                onChange={handlePageChange}
                                size="md"
                                withEdges
                                boundaries={1}
                                siblings={1}
                            />
                        </Stack>
                    </Center>
                )}
            </Stack>
        </Container>
    );
}
