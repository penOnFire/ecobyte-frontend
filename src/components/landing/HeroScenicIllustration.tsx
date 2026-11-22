import type { FC } from 'react'
import { Box } from '@mui/material'

/**
 * Multi-layered scenic vector backdrop for the EcoByte Hero section.
 * Depicts fresh Quezon City morning clouds, the Barangay Commonwealth / MRT-7 ridge,
 * and stylized tropical neighborhood acacia/narra canopies.
 */
export const HeroScenicIllustration: FC = () => {
  return (
    <div className="eco-hero-scenic" aria-hidden="true">
      {/* Layer 1: Upper Sky Cloud Ribbon (slow horizontal drift + subtle vertical float) */}
      <Box
        className="eco-cloud-float"
        sx={{
          position: 'absolute',
          top: { xs: 54, md: 64 },
          left: 0,
          width: '100%',
          zIndex: 1,
          opacity: 0.85,
        }}
      >
        <div className="eco-cloud-sky">
          <svg
            viewBox="0 0 2400 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            {/* First 1200px cloud cycle */}
            <g fill="var(--eco-cloud-fill)">
              <path d="M90 120H310C328 120 342 106 342 88C342 72 330 59 314 57C306 33 283 16 256 16C231 16 209 31 200 52C194 49 187 47 179 47C156 47 137 64 134 86H90C73 86 60 99 60 116C60 118 61 120 63 120H90Z" />
              <path d="M620 142H880C900 142 916 126 916 106C916 88 902 73 884 71C874 42 846 22 814 22C780 22 752 43 742 73C733 68 723 66 712 66C684 66 661 86 657 112H620C603 112 590 125 590 142H620Z" />
              <path d="M990 105H1150C1164 105 1175 94 1175 80C1175 67 1165 57 1152 56C1145 38 1128 26 1108 26C1086 26 1068 39 1061 59C1044 59 1030 71 1028 87H990C979 87 970 95 970 105H990Z" />
            </g>
            {/* Duplicated 1200px cloud cycle for seamless loop */}
            <g transform="translate(1200, 0)" fill="var(--eco-cloud-fill)">
              <path d="M90 120H310C328 120 342 106 342 88C342 72 330 59 314 57C306 33 283 16 256 16C231 16 209 31 200 52C194 49 187 47 179 47C156 47 137 64 134 86H90C73 86 60 99 60 116C60 118 61 120 63 120H90Z" />
              <path d="M620 142H880C900 142 916 126 916 106C916 88 902 73 884 71C874 42 846 22 814 22C780 22 752 43 742 73C733 68 723 66 712 66C684 66 661 86 657 112H620C603 112 590 125 590 142H620Z" />
              <path d="M990 105H1150C1164 105 1175 94 1175 80C1175 67 1165 57 1152 56C1145 38 1128 26 1108 26C1086 26 1068 39 1061 59C1044 59 1030 71 1028 87H990C979 87 970 95 970 105H990Z" />
            </g>
          </svg>
        </div>
      </Box>

      {/* Layer 2: Mid-Horizon Cloud Ribbon */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 130, md: 165 },
          left: 0,
          width: '100%',
          zIndex: 2,
          opacity: 0.65,
        }}
      >
        <div className="eco-cloud-mid">
          <svg
            viewBox="0 0 2400 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            <g fill="var(--eco-cloud-mid-fill)">
              <path d="M220 118H430C445 118 458 106 458 90C458 75 446 63 431 62C423 41 403 26 379 26C353 26 331 43 324 67C306 67 291 81 289 99H220C208 99 198 107 198 118H220Z" />
              <path d="M760 128H960C974 128 986 116 986 102C986 89 976 78 963 77C956 58 938 45 917 45C893 45 874 61 867 83C850 83 837 96 835 112H760C749 112 740 119 740 128H760Z" />
            </g>
            <g transform="translate(1200, 0)" fill="var(--eco-cloud-mid-fill)">
              <path d="M220 118H430C445 118 458 106 458 90C458 75 446 63 431 62C423 41 403 26 379 26C353 26 331 43 324 67C306 67 291 81 289 99H220C208 99 198 107 198 118H220Z" />
              <path d="M760 128H960C974 128 986 116 986 102C986 89 976 78 963 77C956 58 938 45 917 45C893 45 874 61 867 83C850 83 837 96 835 112H760C749 112 740 119 740 128H760Z" />
            </g>
          </svg>
        </div>
      </Box>

      {/* Layer 3 & 4: Distant Quezon City Ridge, MRT-7 Viaduct Silhouette, and Barangay Green Canopy */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 3,
          lineHeight: 0,
        }}
      >
        <svg
          viewBox="0 0 1440 310"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMax slice"
          style={{ width: '100%', height: 'auto', minHeight: '180px', display: 'block' }}
        >
          {/* Distant Sierra Madre / San Mateo / Batasan Hills */}
          <path
            d="M0 210C180 165 340 152 540 178C740 204 930 148 1160 164C1290 173 1385 192 1440 204V310H0V210Z"
            fill="var(--eco-ridge-far)"
          />

          {/* Subtle Commonwealth Avenue / MRT-7 Elevated Viaduct Silhouette */}
          <g opacity="0.62">
            <rect x="60" y="196" width="1320" height="7" rx="3.5" fill="var(--eco-viaduct)" />
            <rect x="160" y="203" width="10" height="38" fill="var(--eco-viaduct)" />
            <rect x="340" y="203" width="10" height="38" fill="var(--eco-viaduct)" />
            <rect x="520" y="203" width="10" height="38" fill="var(--eco-viaduct)" />
            <rect x="880" y="203" width="10" height="38" fill="var(--eco-viaduct)" />
            <rect x="1060" y="203" width="10" height="38" fill="var(--eco-viaduct)" />
            <rect x="1240" y="203" width="10" height="38" fill="var(--eco-viaduct)" />
            {/* Station Canopy Silhouette */}
            <path d="M475 186C495 174 545 174 565 186L578 196H462L475 186Z" fill="var(--eco-viaduct-cap)" />
          </g>

          {/* Midground Barangay Commonwealth Rolling Parkland */}
          <path
            d="M0 242C220 212 430 225 670 246C910 267 1150 214 1440 232V310H0V242Z"
            fill="var(--eco-ridge-mid)"
          />

          {/* Left & Right Tropical Acacia / Narra Canopy Clusters */}
          <g fill="var(--eco-viaduct-cap)" opacity="0.36">
            <circle cx="52" cy="246" r="42" />
            <circle cx="105" cy="256" r="34" />
            <circle cx="1365" cy="240" r="46" />
            <circle cx="1305" cy="254" r="35" />
          </g>
          <g fill="#0F2417" opacity="0.24">
            <circle cx="24" cy="264" r="32" />
            <circle cx="1412" cy="258" r="36" />
          </g>

          {/* Soft Transition Band into Landing Canvas */}
          <path
            d="M0 278C360 258 720 286 1080 268C1240 260 1360 268 1440 274V310H0V278Z"
            fill="var(--eco-alabaster)"
          />
        </svg>
      </Box>
    </div>
  )
}
