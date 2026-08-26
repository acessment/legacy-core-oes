const Page = () => {
    return (
        <div>
            <h1>Admin Home Page</h1>
            <p>Welcome to the admin dashboard!</p>
            {/* Add more admin-specific components or features here */}
        </div>
    );
};

export const AdminHomeCorePage = () => {
    return <Page />;
}

export const AdminHomePage = () => {
    return <AdminHomeCorePage />;
}
