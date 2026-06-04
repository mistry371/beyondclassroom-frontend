import Image from 'next/image'

export default function BannerImage() {
  return (
    <div className="w-full flex justify-center items-center py-3 bg-white border-b border-primary/10">
      <Image
        src="/class_images/banner.jpeg"
        alt="Beyond Classroom"
        width={320}
        height={100}
        className="h-auto object-contain"
        priority
      />
    </div>
  )
}
