import Image from "next/image"

export default function Custom404() {
    return (
        <div className="flex flex-col items-center justify-center ">
            <h1 className="text-4xl font-bold text-center">404</h1>
            <Image src="/assets/panda_lying.gif" alt="404" width={300} height={80} />
            <h2 className="text-3xl text-center">Page Not Found</h2>
        </div>
    )
}