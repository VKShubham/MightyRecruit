const Error = ({message}: {message: string}) => {
  return (
    <div className="p-8 text-center">
      <div className="text-red-500 text-xl">{message}</div>
      <p className="text-gray-600 mt-2">Please try again later</p>
    </div>
  )
}

export default Error