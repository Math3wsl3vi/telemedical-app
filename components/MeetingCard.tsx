"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1,
  handleClick,
  link,
  buttonText,
}: MeetingCardProps) => {
  const { toast } = useToast();

  return (
    <section className="flex min-h-[258px] w-full flex-col justify-between rounded-[14px] border bg-green-1 px-5 py-8 xl:max-w-[568px] font-poppins shadow-md cursor-pointer">
      <article className="flex flex-col gap-5">
        <Image src={icon} alt="upcoming" width={28} height={28} />
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold capitalize">{title}</h1>
            <p className="text-lg border p-2 rounded-md shadow-md">{date}</p>
          </div>
        </div>
      </article>
      <article className={cn("flex justify-end relative", {})}>
        {!isPreviousMeeting && (
          <div className="flex items-center gap-5 ">
            <Button
            variant={'outline'}
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast({
                  title: "Link Copied",
                });
              }}
              className="text-[16px] font-poppins px-6 "
            >
              <Image
                src="/icons/copy.svg"
                alt="feature"
                width={20}
                height={20}
              />
              &nbsp; Copy Link
            </Button>
            <Button onClick={handleClick} className="bg-red-700 font-poppins ">
              {buttonIcon1 && (
                <Image src={buttonIcon1} alt="feature" width={20} height={20}/>
              )} &nbsp; {buttonText}

            </Button>
          </div>
        )}
      </article>
    </section>
  );
};

export default MeetingCard;