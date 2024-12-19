const ErrorMessage = ({ error }) => {
    return (
        <div className="flex justify-center py-4 border-2 border-red-300 rounded-md bg-red-200/40">
            <p className="text-red-500">{JSON.stringify(error)}</p>
        </div>
    );
}

export default ErrorMessage;