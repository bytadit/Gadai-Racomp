'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import { signOut, useSession } from 'next-auth/react';
export function UserNav() {
    // const { data: session } = useSession();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                >
                    <Avatar className="h-10 w-10">
                        {/* <AvatarImage
              src={session.user?.image ?? ''}
              alt={session.user?.name ?? ''}
            />
            <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback> */}
                        <AvatarImage
                            src={
                                'https://cdn-icons-png.flaticon.com/512/6596/6596121.png'
                            }
                            alt={'user avatar'}
                        />
                        <AvatarFallback>Admin</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        {/* <p className="text-sm font-medium leading-none">
              {session.user?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p> */}
                        <p className="text-sm font-medium leading-none">
                            Admin
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            admin@gmail.com
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        Profile
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Billing
                        <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Settings
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>New Team</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {}}>
                    Log out
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
    // if (session) {
    //   return (
    //     <DropdownMenu>
    //       <DropdownMenuTrigger asChild>
    //         <Button variant="ghost" className="relative h-8 w-8 rounded-full">
    //           <Avatar className="h-8 w-8">
    //             {/* <AvatarImage
    //               src={session.user?.image ?? ''}
    //               alt={session.user?.name ?? ''}
    //             />
    //             <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback> */}
    //           </Avatar>
    //         </Button>
    //       </DropdownMenuTrigger>
    //       <DropdownMenuContent className="w-56" align="end" forceMount>
    //         <DropdownMenuLabel className="font-normal">
    //           <div className="flex flex-col space-y-1">
    //             {/* <p className="text-sm font-medium leading-none">
    //               {session.user?.name}
    //             </p>
    //             <p className="text-xs leading-none text-muted-foreground">
    //               {session.user?.email}
    //             </p> */}
    //           </div>
    //         </DropdownMenuLabel>
    //         <DropdownMenuSeparator />
    //         <DropdownMenuGroup>
    //           <DropdownMenuItem>
    //             Profile
    //             <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
    //           </DropdownMenuItem>
    //           <DropdownMenuItem>
    //             Billing
    //             <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
    //           </DropdownMenuItem>
    //           <DropdownMenuItem>
    //             Settings
    //             <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
    //           </DropdownMenuItem>
    //           <DropdownMenuItem>New Team</DropdownMenuItem>
    //         </DropdownMenuGroup>
    //         <DropdownMenuSeparator />
    //         <DropdownMenuItem onClick={() => signOut()}>
    //           Log out
    //           <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
    //         </DropdownMenuItem>
    //       </DropdownMenuContent>
    //     </DropdownMenu>
    //   );
    // }
}
