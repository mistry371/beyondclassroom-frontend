import Image from 'next/image'

export default function BannerImage() {
  return (
    <div className="w-full block bg-white">
      <img
        src="/main-header.png"
        alt="Beyond Classroom"
        className="w-full h-auto object-cover"
      />
    </div>
  )
}
